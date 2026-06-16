/**
 * 图鉴页 — 花朵收集展示 + 品种详情
 */
import api from '../../services/api';

Page({
  data: {
    flowers: [] as Array<Record<string, unknown>>,
    collectedCount: 0,
    totalCount: 48,
    activeFilter: 'all',
    filterOptions: ['all', 'spring', 'summer', 'autumn', 'winter'],
    isLoading: false,
  },

  onShow() { this.loadCollection(); },

  async loadCollection() {
    this.setData({ isLoading: true });
    try {
      const result = await api.get<{ flowers: Array<Record<string, unknown>>; collected: number; total: number }>('/collection');
      this.setData({
        flowers: result.flowers,
        collectedCount: result.collected,
        totalCount: result.total,
      });
    } catch (_) {} finally {
      this.setData({ isLoading: false });
    }
  },

  filterBy(e: WechatMiniprogram.BaseEvent) {
    const filter = e.currentTarget.dataset.filter as string;
    this.setData({ activeFilter: filter });
  },

  goToDetail(e: WechatMiniprogram.BaseEvent) {
    const speciesId = e.currentTarget.dataset.speciesId as string;
    wx.navigateTo({ url: `/pages/collection/detail?id=${speciesId}` });
  },
});
