/**
 * 社交页 — 好友花园互访 + 种子赠送
 */
import api from '../../services/api';

Page({
  data: {
    friends: [] as Array<Record<string, unknown>>,
    giftNotifications: [] as Array<Record<string, unknown>>,
    isLoading: false,
  },

  onShow() { this.loadFriends(); },

  async loadFriends() {
    this.setData({ isLoading: true });
    try {
      const result = await api.get<{ friends: Array<Record<string, unknown>>; gifts: Array<Record<string, unknown>> }>('/social/friends');
      this.setData({ friends: result.friends, giftNotifications: result.gifts });
    } catch (_) {} finally {
      this.setData({ isLoading: false });
    }
  },

  visitGarden(e: WechatMiniprogram.BaseEvent) {
    const userId = e.currentTarget.dataset.userId as string;
    wx.navigateTo({ url: `/pages/social/garden?userId=${userId}` });
  },

  acceptGift(e: WechatMiniprogram.BaseEvent) {
    const giftId = e.currentTarget.dataset.giftId as string;
    api.post(`/social/gifts/${giftId}/accept`).then(() => this.loadFriends());
  },

  onShareAppMessage() {
    return { title: '来看我的赛博花园 🌸', path: '/pages/garden/garden' };
  },
});
