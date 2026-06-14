/**
 * 赛博养花 — 花园状态管理
 * MobX Store: 花园中的花朵、当前聚焦的花、季节状态
 */

import { observable, action, computed, makeObservable } from 'mobx-miniprogram';

type GrowthStage = 'seed' | 'germinating' | 'growing' | 'budding' | 'blooming' | 'fruiting' | 'dormant';

interface FlowerVisualState {
  currentImage: string;
  scale: number;
  rotation: number;
  colorAdjust: { hue: number; saturation: number; brightness: number };
}

interface FlowerPersonality {
  name: string;
  tone: string;
  speakingStyle: string;
}

interface Flower {
  _id: string;
  userId: string;
  seedId: string;
  name: string;
  stage: GrowthStage;
  health: number;
  happiness: number;
  plantedAt: string;
  personality: FlowerPersonality;
  visualState: FlowerVisualState;
  memo: string;
  isFavorite: boolean;
}

interface Seed {
  _id: string;
  name: string;
  rarity: string;
  previewImage: string;
  generatedAt: string;
  status: 'idle' | 'planted' | 'expired' | 'gifted';
}

interface SeasonInfo {
  name: string;
  pinyin: string;
  season: string;
  description: string;
  gardenEffect: string;
}

class GardenStore {
  // ============ 可观察状态 ============
  flowers: Flower[] = [];
  seeds: Seed[] = [];
  currentFlowerIndex = 0;
  currentSeason: string = 'spring';
  currentSolarTerm: SeasonInfo | null = null;
  isLoading = false;
  isPlanting = false;
  careAnimating: string | null = null;

  constructor() {
    makeObservable(this, {
      flowers: observable,
      seeds: observable,
      currentFlowerIndex: observable,
      currentSeason: observable,
      currentSolarTerm: observable,
      isLoading: observable,
      isPlanting: observable,
      careAnimating: observable,
      currentFlower: computed,
      flowerCount: computed,
      hasFlowers: computed,
      setFlowers: action,
      setSeeds: action,
      selectFlower: action,
      setSeason: action,
      setCareAnimating: action,
      updateFlowerAfterCare: action,
    });
  }

  // ============ 计算属性 ============
  get currentFlower(): Flower | null {
    if (this.flowers.length === 0) return null;
    return this.flowers[this.currentFlowerIndex] || null;
  }

  get flowerCount(): number {
    return this.flowers.length;
  }

  get hasFlowers(): boolean {
    return this.flowers.length > 0;
  }

  get floweringFlowers(): Flower[] {
    return this.flowers.filter((f) => f.stage === 'blooming');
  }

  get dormantFlowers(): Flower[] {
    return this.flowers.filter((f) => f.stage === 'dormant');
  }

  // ============ 动作 ============
  setFlowers(flowers: Flower[]): void {
    this.flowers = flowers;
  }

  setSeeds(seeds: Seed[]): void {
    this.seeds = seeds;
  }

  selectFlower(index: number): void {
    if (index >= 0 && index < this.flowers.length) {
      this.currentFlowerIndex = index;
    }
  }

  setSeason(season: string, term: SeasonInfo): void {
    this.currentSeason = season;
    this.currentSolarTerm = term;
  }

  setCareAnimating(animation: string | null): void {
    this.careAnimating = animation;
  }

  updateFlowerAfterCare(flowerId: string, updates: Partial<Flower>): void {
    const idx = this.flowers.findIndex((f) => f._id === flowerId);
    if (idx !== -1) {
      Object.assign(this.flowers[idx], updates);
    }
  }
}

export const gardenStore = new GardenStore();
export default gardenStore;
