/**
 * 好友花园访问页
 */
import api from '../../services/api';

Page({
  data: {
    hostId: '',
    hostName: '',
    flowers: [] as Array<Record<string, unknown>>,
    liked: false,
    comment: '',
    isLoading: true,
  },

  onLoad(options: Record<string, string>) {
    this.setData({ hostId: options.userId || '', hostName: options.name || '花友' });
    wx.setNavigationBarTitle({ title: `${this.data.hostName}的花园` });
    this.loadGarden();
  },

  async loadGarden() {
    try {
      const result = await api.get<{
        hostFlowers: Array<Record<string, unknown>>;
        visitCount: number;
      }>(`/social/garden/${this.data.hostId}`);

      this.setData({ flowers: result.hostFlowers, isLoading: false });
    } catch (_) {
      this.setData({ isLoading: false });
    }
  },

  async handleLike() {
    try {
      await api.post(`/social/garden/${this.data.hostId}/like`);
      this.setData({ liked: true });
      wx.showToast({ title: '已点赞 💚', icon: 'success' });
    } catch (_) {}
  },

  async handleComment() {
    if (!this.data.comment.trim()) return;
    try {
      await api.post(`/social/garden/${this.data.hostId}/comment`, { text: this.data.comment.trim() });
      wx.showToast({ title: '留言成功', icon: 'success' });
      this.setData({ comment: '' });
    } catch (_) {}
  },

  onCommentInput(e: WechatMiniprogram.Input) {
    this.setData({ comment: e.detail.value });
  },
});
