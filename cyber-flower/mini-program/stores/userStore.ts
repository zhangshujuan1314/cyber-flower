/**
 * 赛博养花 — 用户状态管理
 * MobX Store: 用户信息、花园状态、资源
 */

import { observable, action, computed, makeObservable } from 'mobx-miniprogram';

interface UserStats {
  totalFlowers: number;
  currentFlowers: number;
  collectionCount: number;
  gardenLevel: number;
  careStreak: number;
}

interface UserResources {
  water: number;
  fertilizer: number;
  seedSlots: number;
  rareSeedCoupon: number;
}

class UserStore {
  // ============ 可观察状态 ============
  isLoggedIn = false;
  isLoading = false;
  userId = '';
  nickname = '';
  avatar = '';
  stats: UserStats = {
    totalFlowers: 0,
    currentFlowers: 0,
    collectionCount: 0,
    gardenLevel: 1,
    careStreak: 0,
  };
  resources: UserResources = {
    water: 3,
    fertilizer: 1,
    seedSlots: 3,
    rareSeedCoupon: 0,
  };

  constructor() {
    makeObservable(this, {
      isLoggedIn: observable,
      isLoading: observable,
      nickname: observable,
      avatar: observable,
      stats: observable,
      resources: observable,
      gardenLevel: computed,
      canWater: computed,
      canFertilize: computed,
      setUser: action,
      setStats: action,
      useWater: action,
      useFertilizer: action,
      resetResources: action,
      logout: action,
    });
  }

  // ============ 计算属性 ============
  get gardenLevel(): number {
    return this.stats.gardenLevel;
  }

  get canWater(): boolean {
    return this.resources.water > 0;
  }

  get canFertilize(): boolean {
    return this.resources.fertilizer > 0;
  }

  get nextLevelExp(): number {
    return this.stats.gardenLevel * 100;
  }

  // ============ 动作 ============
  setUser(user: { id: string; nickname: string; avatar: string }): void {
    this.userId = user.id;
    this.nickname = user.nickname;
    this.avatar = user.avatar;
    this.isLoggedIn = true;
  }

  setStats(stats: Partial<UserStats>): void {
    Object.assign(this.stats, stats);
  }

  useWater(): boolean {
    if (this.resources.water <= 0) return false;
    this.resources.water -= 1;
    return true;
  }

  useFertilizer(): boolean {
    if (this.resources.fertilizer <= 0) return false;
    this.resources.fertilizer -= 1;
    return true;
  }

  resetResources(): void {
    this.resources.water = 3;
    this.resources.fertilizer = 1;
  }

  logout(): void {
    this.isLoggedIn = false;
    this.userId = '';
    this.nickname = '';
    this.avatar = '';
  }
}

export const userStore = new UserStore();
export default userStore;
