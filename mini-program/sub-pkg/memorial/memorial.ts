/**
 * 纪念花园 — 记得每一朵花的故事
 */
import api from '../../services/api';

interface MemorialFlower {
  _id: string;
  name: string;
  image: string;
  plantedAt: string;
  endedAt: string;
  lifespan: number;
  totalCareCount: number;
  totalChatCount: number;
  bloomedDate?: string;
  memo: string;
  previousLife?: string; // 轮回到下一朵花的ID
}

Page({
  data: {
    memorialFlowers: [] as MemorialFlower[],
    totalLives: 0,
    totalCareActions: 0,
    isLoading: false,
  },

  onShow() { this.loadMemorial(); },

  async loadMemorial() {
    this.setData({ isLoading: true });
    try {
      const result = await api.get<{ flowers: MemorialFlower[]; stats: { totalLives: number; totalCareActions: number } }>('/collection/memorial');
      this.setData({
        memorialFlowers: result.flowers,
        totalLives: result.stats.totalLives,
        totalCareActions: result.stats.totalCareActions,
      });
    } catch (_) {} finally {
      this.setData({ isLoading: false });
    }
  },

  viewFlowerStory(e: WechatMiniprogram.BaseEvent) {
    const flower = e.currentTarget.dataset.flower as MemorialFlower;
    wx.showModal({
      title: flower.name,
      content: `${flower.memo || '一朵安静的花'}\n\n🌱 种于: ${flower.plantedAt.slice(0,10)}\n🌸 ${flower.bloomedDate ? '开花: ' + flower.bloomedDate.slice(0,10) : '未及开花'}\n🍂 谢于: ${flower.endedAt.slice(0,10)}\n💧 被照料 ${flower.totalCareCount} 次\n💬 对话 ${flower.totalChatCount} 次\n⏳ 陪伴了 ${flower.lifespan} 天`,
      confirmText: '🔄 轮回',
      cancelText: '关闭',
      success: (res) => {
        if (res.confirm && flower.previousLife) {
          wx.switchTab({ url: '/pages/garden/garden' });
        }
      },
    });
  },

  onShareAppMessage() {
    return { title: `我在赛博养花中陪伴了 ${this.data.totalLives} 个生命 🌸`, path: '/pages/garden/garden' };
  },
});
