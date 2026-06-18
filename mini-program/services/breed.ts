/**
 * 育种数据服务
 */
import api from './api';

export interface SeedData {
  _id: string;
  name: string;
  rarity: string;
  previewImage: string;
  genome: Record<string, unknown>;
  origin: { type: string; keyword?: string };
  generatedAt: string;
  status: 'idle' | 'planted' | 'expired' | 'gifted';
}

export const breedService = {
  /** AI关键词生成种子 */
  async generateSeed(keyword: string, mood?: string): Promise<SeedData> {
    return api.post<SeedData>('/seeds/generate', { keyword, mood });
  },

  /** 获取每日种子 */
  async getDailySeeds(): Promise<{ seeds: SeedData[]; claimed: boolean }> {
    return api.get('/seeds/daily');
  },

  /** 获取我的种子 */
  async getMySeeds(): Promise<SeedData[]> {
    return api.get('/seeds');
  },

  /** 种植种子 */
  async plantSeed(seedId: string): Promise<Record<string, unknown>> {
    return api.post(`/seeds/${seedId}/plant`);
  },

  /** 赠送种子 */
  async giftSeed(seedId: string, toUserId: string, message?: string): Promise<void> {
    return api.post(`/seeds/${seedId}/gift`, { toUserId, message });
  },
};
