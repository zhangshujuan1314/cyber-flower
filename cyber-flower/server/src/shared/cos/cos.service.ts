import { Injectable, Logger } from '@nestjs/common';

interface CosUploadResult {
  url: string;
  key: string;
  bucket: string;
  region: string;
}

@Injectable()
export class CosService {
  private readonly logger = new Logger(CosService.name);

  // TODO: 生产环境接入腾讯云COS SDK
  // private cos: COS;

  constructor() {
    // this.cos = new COS({
    //   SecretId: process.env.COS_SECRET_ID,
    //   SecretKey: process.env.COS_SECRET_KEY,
    // });
  }

  /**
   * 上传图片到COS
   * TODO: 接入真实COS SDK
   */
  async uploadImage(file: { buffer: Buffer; originalname: string; mimetype: string }, folder: string): Promise<CosUploadResult> {
    const key = `${folder}/${Date.now()}_${file.originalname}`;
    const bucket = process.env.COS_BUCKET || 'cyber-bloom-images';
    const region = process.env.COS_REGION || 'ap-guangzhou';

    this.logger.log(`[COS] Uploading: ${key}`);

    // TODO: 真实上传
    // await this.cos.putObject({ Bucket: bucket, Region: region, Key: key, Body: file.buffer });

    return {
      url: `https://${bucket}.cos.${region}.myqcloud.com/${key}`,
      key,
      bucket,
      region,
    };
  }

  /**
   * 生成CDN加速URL
   */
  getCdnUrl(key: string): string {
    const cdnDomain = process.env.CDN_DOMAIN || `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION}.myqcloud.com`;
    return `${cdnDomain}/${key}`;
  }

  /**
   * 删除图片
   */
  async deleteImage(key: string): Promise<void> {
    this.logger.log(`[COS] Deleting: ${key}`);
    // TODO: 真实删除
  }

  /**
   * 批量生成花朵阶段图片URL
   */
  getFlowerStageUrls(flowerId: string, stages: string[]): Record<string, string> {
    const urls: Record<string, string> = {};
    for (const stage of stages) {
      urls[stage] = this.getCdnUrl(`flowers/${flowerId}/${stage}.webp`);
    }
    return urls;
  }
}
