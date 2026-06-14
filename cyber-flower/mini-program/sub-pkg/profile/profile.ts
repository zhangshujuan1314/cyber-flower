/**
 * 个人中心 — 用户信息 + 花园统计 + 设置
 */
import { userStore } from '../../stores/userStore';
import authService from '../../services/auth';

Page({
  data: {
    safeAreaTop: 44,
    isLoggedIn: false,
    nickname: '',
    avatar: '',
    stats: { totalFlowers: 0, currentFlowers: 0, collectionCount: 0, gardenLevel: 1, careStreak: 0 },
    menuItems: [
      { icon: '🌸', title: '纪念花园', desc: '记得每一朵花的故事', url: '' },
      { icon: '📊', title: '生长报告', desc: '看看你的养护数据', url: '' },
      { icon: '🔔', title: '提醒设置', desc: '照料提醒、节气通知', url: '' },
      { icon: '🎨', title: '花园主题', desc: '自定义你的花园风格', url: '' },
      { icon: '❓', title: '帮助与反馈', desc: '常见问题、意见反馈', url: '' },
      { icon: '⚙️', title: '设置', desc: '账号、隐私、关于', url: '' },
    ],
  },

  onLoad() {
    const h = wx.getSystemInfoSync().statusBarHeight || 44;
    this.setData({ safeAreaTop: h });
  },

  onShow() {
    this.setData({
      isLoggedIn: userStore.isLoggedIn,
      nickname: userStore.nickname,
      avatar: userStore.avatar,
      stats: { ...userStore.stats },
    });
  },

  async handleLogin() {
    try {
      const user = await authService.login();
      userStore.setUser(user);
      this.setData({ isLoggedIn: true, nickname: user.nickname, avatar: user.avatar });
    } catch (error) {
      wx.showToast({ title: '登录失败', icon: 'none' });
    }
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后不会丢失你的花朵数据',
      success: (res) => {
        if (res.confirm) {
          authService.logout();
          userStore.logout();
          this.setData({ isLoggedIn: false, nickname: '', avatar: '' });
        }
      },
    });
  },

  onShareAppMessage() {
    return { title: '来赛博养花，和我一起养AI之花 🌸', path: '/pages/garden/garden' };
  },
});
