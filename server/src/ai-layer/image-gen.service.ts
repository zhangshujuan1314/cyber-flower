import { Injectable, Logger } from '@nestjs/common';
import { CosService } from '../shared/cos/cos.service';
import { buildImagePrompt, IMAGE_GEN_NEGATIVE } from './prompt-templates';

interface ImageGenResult {
  imageUrl: string;
  seed: number;
  width: number;
  height: number;
  latency: number;
}

@Injectable()
export class ImageGenService {
  private readonly logger = new Logger(ImageGenService.name);
  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor(private cosService: CosService) {
    this.endpoint = process.env.AI_IMAGE_ENDPOINT || 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
    this.apiKey = process.env.AI_IMAGE_API_KEY || '';
  }

  /**
   * 生成花朵图像
   */
  async generateFlowerImage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seedGenome: any,
    flowerId: string,
    stage: string = 'blooming',
  ): Promise<ImageGenResult> {
    const startTime = Date.now();
    const prompt = buildImagePrompt(seedGenome);
    const stagePrompt = this.getStagePromptAddition(stage);

    try {
      const body = {
        text_prompts: [
          { text: prompt + ', ' + stagePrompt, weight: 1.0 },
          { text: IMAGE_GEN_NEGATIVE, weight: -1.0 },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
        style_preset: 'photographic',
      };

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Image gen API error: ${response.status}`);
      }

      const data = await response.json() as {
        artifacts: Array<{ base64: string; seed: number }>;
      };

      const artifact = data.artifacts[0];
      if (!artifact) throw new Error('No image generated');

      // 上传到COS
      const buffer = Buffer.from(artifact.base64, 'base64');
      const upload = await this.cosService.uploadImage(
        { buffer, originalname: `${flowerId}_${stage}.png`, mimetype: 'image/png' },
        `flowers/${flowerId}`,
      );

      const latency = Date.now() - startTime;
      this.logger.log(`[ImageGen] ${flowerId}/${stage} | ${latency}ms | seed=${artifact.seed}`);

      return {
        imageUrl: upload.url,
        seed: artifact.seed,
        width: 1024,
        height: 1024,
        latency,
      };
    } catch (error) {
      this.logger.error(`[ImageGen] Error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 生成花朵所有阶段的图像
   */
  async generateAllStageImages(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seedGenome: any,
    flowerId: string,
  ): Promise<Record<string, string>> {
    const stages = ['seed', 'germinating', 'growing', 'budding', 'blooming', 'fruiting', 'dormant'];
    const urls: Record<string, string> = {};

    this.logger.log(`[ImageGen] Generating ${stages.length} stages for ${flowerId}`);

    // 先确定种子(用于后续阶段一致性)
    const baseSeed = Math.floor(Math.random() * 4294967295);

    for (const stage of stages) {
      try {
        const result = await this.generateFlowerImage(seedGenome, flowerId, stage);
        urls[stage] = result.imageUrl;
      } catch (error) {
        this.logger.error(`[ImageGen] Failed stage ${stage}: ${(error as Error).message}`);
        urls[stage] = ''; // 降级: 空URL
      }
    }

    return urls;
  }

  /** 各阶段的Prompt补充 */
  private getStagePromptAddition(stage: string): string {
    const map: Record<string, string> = {
      seed: 'a single seed on soil, macro photography',
      germinating: 'a tiny sprout emerging from dark soil, first two leaves visible, macro',
      growing: 'a young plant with developing leaves and a visible stem, botanical',
      budding: 'a plant with a closed flower bud about to bloom, anticipation',
      blooming: 'a fully bloomed spectacular flower in its prime, vibrant, perfect',
      fruiting: 'a mature flower with seed pods forming, slightly fading petals',
      dormant: 'a resting plant in winter mode, subdued colors, sleeping beauty',
    };
    return map[stage] || 'beautiful flower botanical photograph';
  }
}
