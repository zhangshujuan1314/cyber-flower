/**
 * FlowerViewer — 花朵Canvas渲染组件
 * 使用FlowerRenderer引擎实现真实感分层渲染
 */
import { FlowerRenderer, RenderLayer } from '../../utils/flower-renderer';

const STAGE_LAYER_CONFIG: Record<string, Record<string, number>> = {
  seed:       { shadow:0.2, pot:1, stem:0, leaves:0, calyx:0, petals:0, center:0 },
  germinating:{ shadow:0.2, pot:1, stem:0.6, leaves:0, calyx:0, petals:0, center:0 },
  growing:    { shadow:0.3, pot:1, stem:1, leaves:0.8, calyx:0, petals:0, center:0 },
  budding:    { shadow:0.3, pot:1, stem:1, leaves:1, calyx:0.7, petals:0, center:0 },
  blooming:   { shadow:0.3, pot:1, stem:1, leaves:1, calyx:1, petals:1, center:1 },
  fruiting:   { shadow:0.3, pot:1, stem:1, leaves:0.8, calyx:0.8, petals:0.5, center:0.3 },
  dormant:    { shadow:0.2, pot:1, stem:1, leaves:0.3, calyx:0, petals:0, center:0 },
};

Component({
  properties: {
    flower: { type: Object, value: null, observer: 'onFlowerChange' },
    careAnimating: { type: String, value: '', observer: 'onCareAnimatingChange' },
    size: { type: Number, value: 500 },
  },

  data: {
    canvasWidth: 500,
    canvasHeight: 500,
  },

  lifetimes: {
    attached() {
      const size = this.properties.size;
      this.setData({ canvasWidth: size, canvasHeight: size });
      this.renderer = new FlowerRenderer();
    },
    ready() {
      this.initCanvas();
    },
    detached() {
      if (this.renderer) this.renderer.stop();
    },
  },

  methods: {
    initCanvas() {
      const query = this.createSelectorQuery();
      query.select('#flower-canvas').fields({ node: true, size: true }).exec((res) => {
        if (res[0] && res[0].node) {
          const canvas = res[0].node;
          const dpr = wx.getWindowInfo().pixelRatio;
          canvas.width = this.data.canvasWidth * dpr;
          canvas.height = this.data.canvasHeight * dpr;
          this.renderer.bindCanvas(canvas, this.data.canvasWidth, this.data.canvasHeight);
          this.renderer.start();

          // renderer 就绪后重放——onFlowerChange 先到时 guard 挡掉了，这里补上
          if (this.data.flower) {
            this.updateFlowerLayers(this.data.flower as Record<string, unknown>);
          }
        }
      });
    },

    /** 花朵数据变化 */
    onFlowerChange(flower: Record<string, unknown> | null) {
      if (!flower || !this.renderer) return;
      this.updateFlowerLayers(flower);
    },

    /** 更新图层 */
    updateFlowerLayers(flower: Record<string, unknown>) {
      if (!this.renderer || typeof this.renderer.updateLayers !== 'function') return;
      const stage = (flower.stage as string) || 'seed';
      const config = STAGE_LAYER_CONFIG[stage] || STAGE_LAYER_CONFIG.seed;
      const baseImg = (flower.visualState as Record<string, string>)?.currentImage || '';

      const layers: RenderLayer[] = [
        { image: `${baseImg}_shadow`, opacity: config.shadow, targetOpacity: config.shadow, scale: 1, rotation: 0, zIndex: 1, offsetY: 0, key: 'shadow' },
        { image: `${baseImg}_pot`, opacity: config.pot, targetOpacity: config.pot, scale: 1, rotation: 0, zIndex: 2, offsetY: 0, key: 'pot' },
        { image: `${baseImg}_stem`, opacity: config.stem, targetOpacity: config.stem, scale: 1, rotation: 0, zIndex: 3, offsetY: 0, key: 'stem' },
        { image: `${baseImg}_leaves`, opacity: config.leaves, targetOpacity: config.leaves, scale: 1, rotation: 0, zIndex: 4, offsetY: 0, key: 'leaves' },
        { image: `${baseImg}_calyx`, opacity: config.calyx, targetOpacity: config.calyx, scale: 1, rotation: 0, zIndex: 5, offsetY: 0, key: 'calyx' },
        { image: `${baseImg}_petals`, opacity: config.petals, targetOpacity: config.petals, scale: 1, rotation: 0, zIndex: 6, offsetY: -160, key: 'petals' },
        { image: `${baseImg}_center`, opacity: config.center, targetOpacity: config.center, scale: 1, rotation: 0, zIndex: 7, offsetY: -160, key: 'center' },
      ];

      this.renderer.updateLayers(layers);
    },

    /** 养护动画变化 */
    onCareAnimatingChange(anim: string | null) {
      if (anim && this.renderer) {
        this.renderer.triggerCareEffect(anim);
      }
    },

    /** 触摸事件 */
    onTouchStart(e: WechatMiniprogram.TouchEvent) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartTime = Date.now();
      this.touchStartY = e.touches[0].clientY;
    },

    onTouchMove(e: WechatMiniprogram.TouchEvent) {
      if (!this.renderer || this.touchStartX === undefined) return;
      const dx = e.touches[0].clientX - this.touchStartX;
      const rotation = Math.max(-15, Math.min(15, dx * 0.1));
      this.renderer.setRotation(rotation);
    },

    onTouchEnd() {
      if (!this.renderer) return;
      this.renderer.setRotation(0);

      const duration = Date.now() - (this.touchStartTime || 0);
      const dx = Math.abs((this as Record<string, number>)._lastDx || 0);

      if (duration < 300 && dx < 5) {
        this.triggerEvent('doubletap');
      } else if (dx > 20) {
        this.triggerEvent('swipe', { direction: (this as Record<string, number>)._lastDx > 0 ? 'left' : 'right' });
      }

      this.touchStartX = undefined;
      this.touchStartTime = undefined;
    },
  },
});
