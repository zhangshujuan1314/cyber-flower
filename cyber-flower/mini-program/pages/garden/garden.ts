/**
 * 花园主页 — 核心养成体验 (完整API集成版)
 */
import { createStoreBindings } from 'mobx-miniprogram-bindings';
import { gardenStore } from '../../stores/gardenStore';
import { userStore } from '../../stores/userStore';
import { flowerService, FlowerData, CareResult } from '../../services/flower';
import { breedService } from '../../services/breed';
import { chatService } from '../../services/chat';
import { getCurrentSolarTerm } from '../../utils/season-utils';
import authService from '../../services/auth';

Page({
  data: {
    safeAreaTop: 44,
    showCarePanel: false,
    showChatPreview: false,
    chatMessage: '',
    isFirstVisit: true,
    isPlanting: false,
    isGeneratingSeed: false,
    seedKeyword: '',
  },

  storeBindings: null as WechatMiniprogram.StoreBindings | null,

  onLoad() {
    this.setData({ safeAreaTop: wx.getSystemInfoSync().statusBarHeight || 44 });

    (this as Record<string, unknown>).storeBindings = createStoreBindings(this, {
      store: gardenStore,
      fields: ['flowers', 'currentFlower', 'flowerCount', 'hasFlowers', 'currentSeason', 'isLoading', 'careAnimating'],
      actions: ['setFlowers', 'setSeason', 'selectFlower', 'setCareAnimating'],
    });
  },

  async onShow() {
    if (!userStore.isLoggedIn) {
      try {
        const user = await authService.login();
        userStore.setUser(user);
      } catch {
        // 静默失败，用户可以浏览但无法互动
      }
    }

    // 加载花园数据
    await this.loadGarden();
  },

  onUnload() {
    if ((this as Record<string, unknown>).storeBindings) {
      ((this as Record<string, unknown>).storeBindings as WechatMiniprogram.StoreBindings).destroyStoreBindings();
    }
  },

  async onPullDownRefresh() {
    await this.loadGarden();
    wx.stopPullDownRefresh();
  },

  /** 加载花园数据 */
  async loadGarden() {
    try {
      gardenStore.isLoading = true;

      const [flowers, season] = await Promise.all([
        flowerService.getMyFlowers().catch(() => [] as FlowerData[]),
        Promise.resolve(getCurrentSolarTerm()),
      ]);

      gardenStore.setFlowers(flowers as never);
      gardenStore.setSeason(season.season, {
        name: season.name,
        pinyin: season.pinyin,
        season: season.season,
        description: season.description,
        gardenEffect: season.gardenEffect,
      });

      const visited = wx.getStorageSync('garden_visited');
      if (!visited) {
        wx.setStorageSync('garden_visited', true);
      } else {
        this.setData({ isFirstVisit: false });
      }
    } catch (error) {
      console.error('[Garden] Load failed:', error);
    } finally {
      gardenStore.isLoading = false;
    }
  },

  /** 照料操作 */
  async handleCare(e: WechatMiniprogram.CustomEvent) {
    const { action, value } = e.detail;
    const flower = gardenStore.currentFlower as FlowerData | null;
    if (!flower) return;

    // 检查资源
    if (action === 'water' && !userStore.canWater) {
      wx.showToast({ title: '今日浇水次数已用完', icon: 'none' });
      return;
    }

    gardenStore.setCareAnimating(action);

    try {
      const result = await flowerService.care(flower._id, action, value) as CareResult;
      gardenStore.updateFlowerAfterCare(flower._id, result.flower as never);

      // 触觉 + 资源消耗
      wx.vibrateShort({ type: 'light' });
      if (action === 'water') userStore.useWater();
      if (action === 'fertilize') userStore.useFertilizer();

      this.showChatPreview(result);
    } catch (error) {
      console.error('[Garden] Care failed:', error);
      wx.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setTimeout(() => gardenStore.setCareAnimating(null), 2000);
    }
  },

  /** 显示花语气泡 */
  showChatPreview(result: CareResult) {
    const messages: Record<string, string> = {
      water: '好甜的水~ 🌧️',
      fertilize: '营养满满，谢谢你！🌱',
      prune: '清爽多了~ ✨',
      adjust_light: '阳光真舒服 ☀️',
    };
    this.setData({
      showChatPreview: true,
      chatMessage: messages[result.animation?.type] || '谢谢照料~',
    });
    setTimeout(() => this.setData({ showChatPreview: false }), 3000);
  },

  /** 切换花朵 */
  handleSwipeFlower(e: WechatMiniprogram.CustomEvent) {
    const count = gardenStore.flowerCount;
    if (count <= 1) return;

    let next = gardenStore.currentFlowerIndex;
    if (e.detail.direction === 'left') next = (next + 1) % count;
    else next = (next - 1 + count) % count;
    gardenStore.selectFlower(next);
  },

  /** 快速育种 */
  async handleQuickBreed() {
    if (!this.data.seedKeyword.trim()) return;

    this.setData({ isGeneratingSeed: true });
    try {
      const seed = await breedService.generateSeed(this.data.seedKeyword.trim());
      wx.showToast({ title: `获得种子: ${seed.name}`, icon: 'success' });

      // 直接种植
      const flower = await breedService.plantSeed(seed._id);
      await this.loadGarden();

      wx.vibrateShort({ type: 'heavy' });
    } catch (error) {
      wx.showToast({ title: '生成失败', icon: 'none' });
    } finally {
      this.setData({ isGeneratingSeed: false, seedKeyword: '' });
    }
  },

  /** 快速对话 */
  async goToChat() {
    const flower = gardenStore.currentFlower as FlowerData | null;
    if (!flower) return;
    wx.navigateTo({ url: `/sub-pkg/chat/chat?flowerId=${flower._id}&name=${flower.name}&image=${flower.visualState?.currentImage || ''}` });
  },

  goToBreed() {
    wx.switchTab({ url: '/pages/breed/breed' });
  },

  onSeedKeywordInput(e: WechatMiniprogram.Input) {
    this.setData({ seedKeyword: e.detail.value });
  },

  onShareAppMessage() {
    const flower = gardenStore.currentFlower as FlowerData | null;
    return {
      title: flower ? `来看看我的 ${flower.name} 🌸 在赛博养花` : '来赛博养花，和我一起培育独一无二的AI之花 🌱',
      path: '/pages/garden/garden',
      imageUrl: flower?.visualState?.currentImage,
    };
  },
});
