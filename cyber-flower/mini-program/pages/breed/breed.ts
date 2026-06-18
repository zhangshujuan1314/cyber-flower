/**
 * 育种页 — 静态 UI + 假数据
 * 当前阶段：UI 还原，不接后端，不接真实生成逻辑
 */

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
}

interface MySeed {
  id: string;
  name: string;
  rarity: 'common' | 'rare';
  rarityText: string;
  level: number;
  progress: number;
  color: string;
}

Page({
  data: {
    /* 自定义导航 */
    statusBarHeight: 0,

    /* 输入 */
    keyword: '',
    keywordLength: 0,

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
      { name: '野菊', rarity: 'common' as const, rarityText: '普通', color: '#F5D742', locked: false },
      { name: '薄荷', rarity: 'common' as const, rarityText: '普通', color: '#7EC8A0', locked: false },
      { name: '???', rarity: 'rare' as const, rarityText: '稀有', color: '#B8B8B8', locked: true },
    ] as DailySeed[],

    /* 我的种子（假数据） */
    mySeeds: [
      { id: '1', name: '野菊', rarity: 'common' as const, rarityText: '普通', level: 3, progress: 60, color: '#F5D742' },
      { id: '2', name: '薄荷', rarity: 'common' as const, rarityText: '普通', level: 1, progress: 20, color: '#7EC8A0' },
      { id: '3', name: '星辰花', rarity: 'rare' as const, rarityText: '稀有', level: 5, progress: 80, color: '#C4A0F5' },
      { id: '4', name: '野玫瑰', rarity: 'common' as const, rarityText: '普通', level: 2, progress: 40, color: '#F08080' },
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

  /* ---- 事件处理（静态 UI 阶段：仅交互状态，不调后端） ---- */

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

  /** 生成按钮（静态阶段占位） */
  handleGenerate() {
    const { keyword, selectedEmotion } = this.data;
    if (!keyword.trim()) {
      wx.showToast({ title: '请输入关键词', icon: 'none' });
      return;
    }
    wx.showToast({ title: '生成（待接入后端）', icon: 'none' });
  },
});
