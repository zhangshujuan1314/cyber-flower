import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seed, Genome, Rarity } from '../../shared/types/models';
import { FlowerService } from '../flower/flower.service';
import { LlmService } from '../../ai-layer/llm.service';
import { ContentSafetyService } from '../../ai-layer/content-safety.service';
import { ImageGenService } from '../../ai-layer/image-gen.service';
import { SEED_GEN_SYSTEM, seedGenUserPrompt } from '../../ai-layer/prompt-templates';

@Injectable()
export class BreedService {
  private readonly logger = new Logger(BreedService.name);

  constructor(
    @InjectModel('Seed') private seedModel: Model<Seed>,
    private flowerService: FlowerService,
    private llmService: LlmService,
    private safetyService: ContentSafetyService,
    private imageGenService: ImageGenService,
  ) {}

  /** AI关键词生成种子 — 完整AI管道 */
  async generateFromKeyword(userId: string, keyword: string, mood?: string): Promise<Seed> {
    // 1. 内容安全检查
    const safetyCheck = await this.safetyService.checkUserInput(keyword);
    if (!safetyCheck.safe) {
      throw new Error(`内容不符合规范: ${safetyCheck.reason}`);
    }

    const sanitizedKeyword = this.safetyService.sanitize(keyword);

    // 2. LLM生成花种DNA
    this.logger.log(`[Breed] Generating seed for: "${sanitizedKeyword}"`);
    let genomeData: Record<string, unknown> = {};
    try {
      genomeData = await this.llmService.chatJson(
        SEED_GEN_SYSTEM,
        seedGenUserPrompt(sanitizedKeyword, mood),
        { temperature: 0.9, maxTokens: 2048 },
      );
    } catch (error) {
      this.logger.warn('LLM 不可用，降级为默认基因');
    }

    // 3. 构建Genome
    const genome: Genome = {
      species: (genomeData.species as string) || `species_${Date.now()}`,
      displayName: (genomeData.displayName as string) || `${keyword}花`,
      parentLineage: [],
      colors: genomeData.colors as Genome['colors'] || this.defaultColors(),
      morphology: genomeData.morphology as Genome['morphology'] || this.defaultMorphology(),
      growth: genomeData.growth as Genome['growth'] || this.defaultGrowth(),
      rarity: (genomeData.rarity as Rarity) || 'common',
      tags: (genomeData.tags as string[]) || [],
    };

    const rarity = genome.rarity;
    const name = (genomeData.name as string) || this.generateName(keyword);

    // 4. 创建种子记录
    const seed = await this.seedModel.create({
      userId,
      origin: { type: 'keyword', keyword: sanitizedKeyword },
      genome,
      rarity,
      name,
      previewImage: '',
      status: 'idle',
      metadata: {
        imagePrompt: genomeData.imagePrompt,
        aiModel: process.env.AI_LLM_MODEL || 'claude',
      },
    });

    return seed.toObject();
  }

  /** 每日种子掉落 */
  async getDailySeeds(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const claimedToday = await this.seedModel.findOne({
      userId,
      'origin.type': 'daily',
      generatedAt: { $gte: today },
    });

    const names = ['晨露', '暮光', '神秘种子'];
    const seeds: Seed[] = [];

    for (let i = 0; i < 3; i++) {
      const genome = this.generateMockGenome('daily', '');
      const rarity = i === 2 ? (Math.random() > 0.7 ? 'rare' : 'uncommon') : 'common';

      const seed = await this.seedModel.create({
        userId,
        origin: { type: 'daily' },
        genome,
        rarity,
        previewImage: `/assets/seeds/daily_${i}.png`,
        name: names[i],
        status: 'idle',
      });
      seeds.push(seed.toObject());
    }

    return { seeds, claimed: !!claimedToday };
  }

  async getUserSeeds(userId: string): Promise<Seed[]> {
    return this.seedModel.find({ userId, status: 'idle' }).sort({ generatedAt: -1 }).lean();
  }

  async plantSeed(seedId: string, userId: string, flowerName?: string) {
    const seed = await this.seedModel.findOne({ _id: seedId, userId, status: 'idle' });
    if (!seed) throw new Error('种子不存在或已使用');

    const flower = await this.flowerService.create({
      userId,
      seedId: seed._id as string,
      name: flowerName || seed.name,
      genome: seed.genome,
      personality: this.generatePersonality(seed),
      visualState: { currentImage: seed.previewImage, scale: 1, rotation: 0, colorAdjust: { hue: 0, saturation: 1, brightness: 1 } },
    } as never);

    await this.seedModel.updateOne({ _id: seedId }, { $set: { status: 'planted', plantedAt: new Date() } });

    // 异步触发图像生成 (不阻塞种植)
    void this.imageGenService.generateAllStageImages(seed.genome, flower._id as string)
      .then((urls) => {
        this.flowerService.update(flower._id as string, userId, {
          visualState: { currentImage: urls.blooming, scale: 1, rotation: 0, colorAdjust: { hue: 0, saturation: 1, brightness: 1 } },
        } as never);
      })
      .catch((err) => this.logger.error(`[Breed] Image gen failed for flower ${flower._id}: ${err.message}`));

    return flower;
  }

  async giftSeed(seedId: string, fromUserId: string, toUserId: string): Promise<void> {
    const seed = await this.seedModel.findOne({ _id: seedId, userId: fromUserId, status: 'idle' });
    if (!seed) throw new Error('种子不存在或已使用');
    await this.seedModel.updateOne(
      { _id: seedId },
      { $set: { userId: toUserId, status: 'gifted', giftedTo: toUserId } },
    );
  }

  // ============ 辅助方法 (AI不可用时的降级) ============

  private generateMockGenome(keyword: string, mood: string): Genome {
    return {
      species: `species_${Date.now()}`,
      displayName: `${keyword}花`,
      parentLineage: [],
      colors: this.defaultColors(),
      morphology: this.defaultMorphology(),
      growth: this.defaultGrowth(),
      rarity: 'common',
      tags: [],
    };
  }

  private defaultColors() { return { petalPrimary: { r: 220, g: 150, b: 180 }, petalSecondary: { r: 200, g: 170, b: 200 }, petalAccent: { r: 255, g: 210, b: 120 }, center: { r: 255, g: 220, b: 60 }, leaf: { r: 60, g: 140, b: 60 }, stem: { r: 45, g: 100, b: 45 } }; }
  private defaultMorphology() { return { petalShape: 'round', petalCount: 8, petalLayers: 2, bloomSize: 0.6, stemHeight: 0.5, leafDensity: 0.5, leafShape: 'oval' }; }
  private defaultGrowth() { return { germinationDays: 3, bloomDays: 14, fullLifeDays: 45, seasonPreference: 'spring' as const, waterNeed: 0.5, lightNeed: 0.6, toughness: 0.5 }; }

  private generateName(keyword: string): string {
    const suffixes = ['雨', '光', '露', '梦', '雾', '霞', '霜', '风', '云', '月'];
    return keyword.length <= 2 ? keyword + suffixes[Math.floor(Math.random() * suffixes.length)] : keyword.slice(0, 2) + suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  private generatePersonality(seed: Seed) {
    const tones = ['温柔', '活泼', '沉静', '调皮', '优雅', '神秘'];
    return { name: seed.name, tone: tones[Math.floor(Math.random() * tones.length)], speakingStyle: '诗意', moodBaseline: 0.5 + Math.random() * 0.4 };
  }
}
