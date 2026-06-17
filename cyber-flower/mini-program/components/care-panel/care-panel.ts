/**
 * CarePanel — 照料操作面板
 */
Component({
  properties: {
    flower: { type: Object, value: null },
    resources: { type: Object, value: { water: 3, fertilizer: 1 } },
  },

  data: {
    actions: [
      { key: 'water', icon: '💧', label: '浇水', count: '2/3', cooldown: 0 },
      { key: 'fertilize', icon: '🌱', label: '施肥', count: '可用', cooldown: 0 },
      { key: 'prune', icon: '✂️', label: '修剪', count: '按需', cooldown: 0 },
      { key: 'adjust_light', icon: '☀️', label: '光照', count: '65%', cooldown: 0 },
    ],
  },

  methods: {
    onCare(e: WechatMiniprogram.BaseEvent) {
      const action = e.currentTarget.dataset.action as string;
      if (!action) { console.warn('[care-panel] 按钮缺 data-action'); return; }
      const value = action === 'water' ? 15
                  : action === 'fertilize' ? 20
                  : action === 'prune' ? 10 : 5;
      this.triggerEvent('care', { action, value });
    },
  },
});
