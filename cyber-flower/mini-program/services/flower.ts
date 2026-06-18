/**
 * 花朵数据服务
 */
import api from './api';

export interface FlowerData {
  _id: string;
  name: string;
  stage: string;
  health: number;
  happiness: number;
  genome: Record<string, unknown>;
  visualState: {
    currentImage: string;
    scale: number;
    rotation: number;
    colorAdjust: { hue: number; saturation: number; brightness: number };
  };
  personality: {
    name: string;
    tone: string;
    speakingStyle: string;
  };
  plantedAt: string;
  stageTimestamps: Record<string, string>;
  memo: string;
  isFavorite: boolean;
}

export interface CareResult {
  flower: FlowerData;
  effect: { healthDelta: number; happinessDelta: number; growthDelta: number };
  animation: { type: string };
}

export const flowerService = {
  /** 获取用户所有花朵 */
  async getMyFlowers(): Promise<FlowerData[]> {
    return api.get<FlowerData[]>('/flowers');
  },

  /** 获取花朵详情 */
  async getFlower(id: string): Promise<FlowerData> {
    return api.get<FlowerData>(`/flowers/${id}`);
  },

  /** 种植花朵 */
  async plantFlower(seedId: string, name: string): Promise<FlowerData> {
    return api.post<FlowerData>('/flowers', { seedId, name });
  },

  /** 照料操作 */
  async care(flowerId: string, action: string, value: number): Promise<CareResult> {
    return api.post<CareResult>(`/flowers/${flowerId}/care`, { action, value });
  },

  /** 更新花朵信息 */
  async updateFlower(id: string, data: { name?: string; memo?: string; isFavorite?: boolean }): Promise<FlowerData> {
    return api.patch<FlowerData>(`/flowers/${id}`, data as Record<string, unknown>);
  },

  /** 删除花朵 */
  async removeFlower(id: string): Promise<void> {
    return api.delete(`/flowers/${id}`);
  },

  /** 获取生长时间线 */
  async getTimeline(id: string): Promise<Array<{ stage: string; date: string }>> {
    return api.get(`/flowers/${id}/timeline`);
  },
};
