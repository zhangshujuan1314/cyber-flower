/**
 * 育种页 — AI种子生成 + 每日领取 + 种植
 */
import { breedService, SeedData } from '../../services/breed';
import { flowerService } from '../../services/flower';
import { gardenStore } from '../../stores/gardenStore';

Page({
  data: {
    keyword: '',
    selectedMood: '',
    moods: ['😊 开心', '😢 忧伤', '😌 平静', '😆 兴奋', '😍 心动'],
    isGenerating: false,
    generatedSeed: null as SeedData | null,
    dailySeeds: [] as SeedData[],
    dailyClaimed: false,
    mySeeds: [] as SeedData[],
    activeTab: 'generate' as string,
    isPlanting: false,
  },

  onShow() {
    this.loadDailySeeds();
    this.loadMySeeds();
  },

  onKeywordInput(e: WechatMiniprogram.Input) { this.setData({ keyword: e.detail.value }); },

  selectMood(e: WechatMiniprogram.BaseEvent) {
    const mood = e.currentTarget.dataset.mood as string;
    this.setData({ selectedMood: this.data.selectedMood === mood ? '' : mood });
  },

  /** AI生成种子 */
  async generateSeed() {
    if (!this.data.keyword.trim()) {
      wx.showToast({ title: '请输入关键词', icon: 'none' }); return;
    }
    this.setData({ isGenerating: true, generatedSeed: null });
    try {
      const seed = await breedService.generateSeed(this.data.keyword.trim(), this.data.selectedMood);
      this.setData({ generatedSeed: seed, isGenerating: false });
      wx.vibrateShort({ type: 'heavy' });
      this.loadMySeeds();
    } catch (e) {
      wx.showToast({ title: (e as Error).message || '生成失败', icon: 'none' });
      this.setData({ isGenerating: false });
    }
  },

  /** 种植种子 */
  async plantSeed(e: WechatMiniprogram.BaseEvent) {
    const seedId = e.detail.seedId as string;
    this.setData({ isPlanting: true });
    try {
      await breedService.plantSeed(seedId);
      wx.showToast({ title: '种下啦！🌱', icon: 'success' });
      wx.vibrateShort({ type: 'medium' });
      this.loadMySeeds();
      setTimeout(() => wx.switchTab({ url: '/pages/garden/garden' }), 600);
    } catch (err) {
      wx.showToast({ title: '种植失败', icon: 'none' });
    } finally {
      this.setData({ isPlanting: false });
    }
  },

  async loadDailySeeds() {
    try {
      const result = await breedService.getDailySeeds();
      this.setData({ dailySeeds: result.seeds, dailyClaimed: result.claimed });
    } catch (_) {}
  },

  async loadMySeeds() {
    try {
      const seeds = await breedService.getMySeeds();
      this.setData({ mySeeds: seeds });
      gardenStore.setSeeds(seeds as never);
    } catch (_) {}
  },

  switchTab(e: WechatMiniprogram.BaseEvent) {
    this.setData({ activeTab: e.currentTarget.dataset.tab as string });
  },

  onShareAppMessage() {
    return { title: '来赛博养花，用AI创造独一无二的花朵 🌸', path: '/pages/breed/breed' };
  },
});
