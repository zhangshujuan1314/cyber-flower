/**
 * 育种页 — AI种子生成 + 每日领取 + 种植
 * 花图全部走本地哈希 getFlowerImage()，不依赖后端 imageUrl
 */
import { breedService, SeedData } from '../../services/breed';
import { getFlowerImage } from '../../utils/flowerImage';

interface Emotion {
  id: string;
  emoji: string;
  label: string;
}

interface DailySeed {
  name: string;
  rarity: 'common' | 'rare';
  rarityText: string;
  color: string;
  locked: boolean;
  image?: string;
}

interface MySeed {
  id: string;
  name: string;
  rarity: string;
  rarityText: string;
  level: number;
  progress: number;
  color: string;
  image: string;
}

const RARITY_TEXT: Record<string, string> = {
  common: '普通',
  uncommon: '非凡',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const RARITY_COLORS: Record<string, string> = {
  common: '#D8E9AD',
  uncommon: '#E7BE8A',
  rare: '#C4A0F5',
  epic: '#FFB74D',
  legendary: '#F78A8A',
};

function rarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] || '#D8D8D8';
}

Page({
  data: {
    /* 自定义导航 */
    statusBarHeight: 0,

    /* 输入 */
    keyword: '',
    keywordLength: 0,

    /* 生成中 */
    isGenerating: false,

    /* 情绪 */
    emotions: [
      { id: 'happy', emoji: '😊', label: '开心' },
      { id: 'sad', emoji: '😢', label: '忧伤' },
      { id: 'calm', emoji: '😌', label: '平静' },
      { id: 'excited', emoji: '🤩', label: '兴奋' },
      { id: 'heart', emoji: '🥰', label: '心动' },
    ] as Emotion[],
    selectedEmotion: '',

    /* 每日种子（假数据） */
    dailySeeds: [
      { name: '野菊', rarity: 'common' as const, rarityText: '普通', color: '#F5D742', locked: false, image: getFlowerImage('野菊') },
      { name: '薄荷', rarity: 'common' as const, rarityText: '普通', color: '#7EC8A0', locked: false, image: getFlowerImage('薄荷') },
      { name: '???', rarity: 'rare' as const, rarityText: '稀有', color: '#B8B8B8', locked: true },
    ] as DailySeed[],

    /* 我的种子（假数据） */
    mySeeds: [
      { id: '1', name: '野菊',   rarity: 'common', rarityText: '普通', level: 3, progress: 60, color: '#F5D742', image: getFlowerImage('野菊') },
      { id: '2', name: '薄荷',   rarity: 'common', rarityText: '普通', level: 1, progress: 20, color: '#7EC8A0', image: getFlowerImage('薄荷') },
      { id: '3', name: '星辰花', rarity: 'rare',   rarityText: '稀有', level: 5, progress: 80, color: '#C4A0F5', image: getFlowerImage('星辰花') },
      { id: '4', name: '野玫瑰', rarity: 'common', rarityText: '普通', level: 2, progress: 40, color: '#F08080', image: getFlowerImage('野玫瑰') },
    ] as MySeed[],
    mySeedsCount: 4,
  },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
  },

  onShow() {
    const tabBar = this.getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 1 });
    }
  },

  /* ---- 事件处理 ---- */

  /** 返回上一页 / 切到花园 */
  handleBack() {
    wx.navigateBack({
      delta: 1,
      fail() {
        wx.switchTab({ url: '/pages/garden/garden' });
      },
    });
  },

  /** AI 按钮（占位） */
  handleAI() {
    wx.showToast({ title: 'AI 助手（待接入）', icon: 'none' });
  },

  /** 消息按钮（占位） */
  handleMessages() {
    wx.showToast({ title: '消息（待接入）', icon: 'none' });
  },

  /** 输入关键词 */
  onKeywordInput(e: WechatMiniprogram.Input) {
    const value = e.detail.value;
    this.setData({ keyword: value, keywordLength: value.length });
  },

  /** 选择情绪（单选，再次点击取消） */
  selectEmotion(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id as string;
    this.setData({
      selectedEmotion: this.data.selectedEmotion === id ? '' : id,
    });
  },

  /** 生成按钮 — 接 DeepSeek 真实生成 */
  async handleGenerate() {
    const { keyword, selectedEmotion, isGenerating } = this.data;
    if (isGenerating) return;
    if (!keyword.trim()) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }

    this.setData({ isGenerating: true });
    wx.showLoading({ title: 'AI 正在孕育…', mask: true });

    try {
      const seed: SeedData = await breedService.generateSeed(
        keyword.trim(),
        selectedEmotion || undefined,
      );

      // 用 species / name 哈希算本地花图
      const species = (seed.genome as Record<string, unknown>)?.species as string || seed.name;
      const image = getFlowerImage(species);
      const rarityText = RARITY_TEXT[seed.rarity] || seed.rarity;
      const color = rarityColor(seed.rarity);

      const newSeed: MySeed = {
        id: seed._id,
        name: seed.name,
        rarity: seed.rarity,
        rarityText,
        level: 1,
        progress: 0,
        color,
        image,
      };

      const mySeeds = [newSeed, ...this.data.mySeeds];

      wx.hideLoading();
      this.setData({
        isGenerating: false,
        mySeeds,
        mySeedsCount: mySeeds.length,
        keyword: '',
        keywordLength: 0,
        selectedEmotion: '',
      });

      wx.showToast({ title: `获得 ${seed.name} · ${rarityText}`, icon: 'success' });
      wx.vibrateShort({ type: 'heavy' });
    } catch (error) {
      wx.hideLoading();
      this.setData({ isGenerating: false });
      const msg = (error as Error).message || '生成失败，请重试';
      wx.showToast({ title: msg, icon: 'none' });
      console.error('[Breed] generateSeed failed:', error);
    }
  },
});
