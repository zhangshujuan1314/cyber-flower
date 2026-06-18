/**
 * custom-tab-bar 组件逻辑
 * tab 列表与 app.json 保持同步
 */
Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/garden/garden',         text: '花园', icon: '🌷' },
      { pagePath: '/pages/breed/breed',           text: '育种', icon: '🌱' },
      { pagePath: '/pages/collection/collection', text: '图鉴', icon: '📖' },
      { pagePath: '/pages/social/social',         text: '社交', icon: '👥' },
      { pagePath: '/pages/profile/profile',       text: '我的', icon: '👤' },
    ],
  },
  methods: {
    switchTab(e: WechatMiniprogram.BaseEvent) {
      const { index, path } = e.currentTarget.dataset;
      const idx = Number(index);
      if (this.data.selected === idx) return;
      const url = (path as string).startsWith('/') ? (path as string) : '/' + (path as string);
      wx.switchTab({ url, fail(err) { console.error('[custom-tab-bar] switchTab failed:', err); } });
    },
  },
});
