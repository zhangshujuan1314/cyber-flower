/**
 * 赛博养花 — Canvas花朵渲染引擎
 * 分层精灵合成 + 呼吸动画 + 粒子特效
 */

export interface RenderLayer {
  image: string;       // 图片URL
  opacity: number;     // 当前透明度 0-1
  targetOpacity: number;
  scale: number;
  rotation: number;
  zIndex: number;
  offsetY: number;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface FlowerRenderState {
  layers: RenderLayer[];
  particles: Particle[];
  breathPhase: number;       // 呼吸动画相位 0-2PI
  breathAmplitude: number;   // 呼吸幅度
  swayPhase: number;         // 摇摆相位
  swayAmplitude: number;
  scale: number;
  rotation: number;
  targetRotation: number;
  careEffect: string | null;
  careEffectTimer: number;
}

export class FlowerRenderer {
  private canvas: WechatMiniprogram.Canvas | null = null;
  private ctx: WechatMiniprogram.CanvasContext | null = null;
  private state: FlowerRenderState;
  private width = 0;
  private height = 0;
  private animFrame = 0;
  private rafId = 0;
  private images: Map<string, WechatMiniprogram.Image> = new Map();

  constructor() {
    this.state = {
      layers: [],
      particles: [],
      breathPhase: 0,
      breathAmplitude: 0.02,
      swayPhase: 0,
      swayAmplitude: 0,
      scale: 1,
      rotation: 0,
      targetRotation: 0,
      careEffect: null,
      careEffectTimer: 0,
    };
  }

  /** 绑定Canvas */
  bindCanvas(canvas: WechatMiniprogram.Canvas, width: number, height: number): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
  }

  /** 更新花的状态 */
  updateLayers(layers: RenderLayer[]): void {
    for (const layer of layers) {
      layer.targetOpacity = layer.opacity;
    }
    this.state.layers = layers;
  }

  /** 触发养护特效 */
  triggerCareEffect(type: string): void {
    this.state.careEffect = type;
    this.state.careEffectTimer = 60; // 60帧 ≈ 2s

    // 生成粒子
    const cx = this.width / 2;
    const cy = this.height * 0.3;

    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.state.particles.push({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 40 + Math.random() * 30,
        maxLife: 70,
        size: 3 + Math.random() * 5,
        color: type === 'water' ? 'rgba(100,180,255,0.8)' :
               type === 'fertilize' ? 'rgba(139,105,20,0.7)' :
               'rgba(255,200,100,0.6)',
        alpha: 1,
      });
    }
  }

  /** 设置触摸旋转 */
  setRotation(degrees: number): void {
    this.state.targetRotation = degrees;
  }

  /** 开始渲染循环 */
  start(): void {
    this.loop();
  }

  /** 停止渲染循环 */
  stop(): void {
    if (this.rafId) {
      // cancelAnimationFrame equivalent for mini-program
      this.rafId = 0;
    }
  }

  /** 主渲染循环 */
  private loop(): void {
    if (!this.ctx || !this.canvas) return;

    this.update();
    this.render();

    this.animFrame++;
    this.rafId = setTimeout(() => this.loop(), 33) as unknown as number; // ~30fps
  }

  /** 更新动画状态 */
  private update(): void {
    const s = this.state;

    // 呼吸动画
    s.breathPhase += 0.04;
    if (s.breathPhase > Math.PI * 2) s.breathPhase -= Math.PI * 2;
    const breathScale = 1 + Math.sin(s.breathPhase) * s.breathAmplitude;

    // 摇摆动画
    s.swayPhase += 0.02;
    s.swayAmplitude += (0.01 - s.swayAmplitude) * 0.05; // 衰减到微小幅度
    const sway = Math.sin(s.swayPhase) * s.swayAmplitude;

    // 旋转平滑过渡
    s.rotation += (s.targetRotation - s.rotation) * 0.15;

    // 图层透明度过渡
    for (const layer of s.layers) {
      layer.opacity += (layer.targetOpacity - layer.opacity) * 0.1;
    }

    // 养护特效计时
    if (s.careEffectTimer > 0) {
      s.careEffectTimer--;
      if (s.careEffectTimer === 0) s.careEffect = null;
    }

    // 粒子更新
    for (const p of s.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // 重力
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
    s.particles = s.particles.filter((p) => p.life > 0);

    // 综合缩放
    s.scale = breathScale;
  }

  /** 渲染一帧 */
  private render(): void {
    const ctx = this.ctx!;
    const s = this.state;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // 清屏
    ctx.clearRect(0, 0, w, h);

    // 背景光晕 (养护特效时)
    if (s.careEffect === 'water') {
      const gradient = ctx.createRadialGradient(cx, cy * 0.7, 50, cx, cy * 0.7, 200);
      gradient.addColorStop(0, 'rgba(100,180,255,0.15)');
      gradient.addColorStop(1, 'rgba(100,180,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.save();

    // 应用全局变换
    ctx.translate(cx, cy);
    ctx.scale(s.scale, s.scale);
    ctx.rotate(s.rotation * Math.PI / 180);

    // 按zIndex排序绘制图层
    const sortedLayers = [...s.layers].sort((a, b) => a.zIndex - b.zIndex);

    for (const layer of sortedLayers) {
      if (layer.opacity <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      // 图层变换
      ctx.translate(0, layer.offsetY);
      ctx.scale(layer.scale, layer.scale);

      // TODO: 绘制真实图片
      // if (this.images.has(layer.image)) {
      //   const img = this.images.get(layer.image)!;
      //   ctx.drawImage(img, -img.width/2, -img.height/2, img.width, img.height);
      // }

      // 当前使用渐变色模拟花瓣
      this.drawPlaceholderFlower(ctx, layer);

      ctx.restore();
    }

    ctx.restore();

    // 绘制粒子
    for (const p of s.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /** 占位花朵绘制 (TODO: 替换为真实图片渲染) */
  private drawPlaceholderFlower(ctx: WechatMiniprogram.CanvasContext, layer: RenderLayer): void {
    const colors: Record<string, string> = {
      shadow: 'rgba(0,0,0,0.1)',
      pot: '#8B6914',
      stem: '#3E7B52',
      leaves: '#4CAF50',
      calyx: '#2D5A3D',
      petals: '#E75480',
      center: '#FFD700',
    };

    ctx.fillStyle = colors[layer.key] || '#ccc';

    switch (layer.key) {
      case 'shadow':
        ctx.beginPath();
        ctx.ellipse(0, 140, 80, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'pot':
        // 梯形花盆
        ctx.beginPath();
        ctx.moveTo(-50, -20);
        ctx.lineTo(-40, 60);
        ctx.lineTo(40, 60);
        ctx.lineTo(50, -20);
        ctx.closePath();
        ctx.fill();
        break;
      case 'stem':
        ctx.strokeStyle = colors.stem;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // 轻微弯曲的茎
        ctx.moveTo(0, -20);
        ctx.quadraticCurveTo(10, -80, 0, -160);
        ctx.stroke();
        break;
      case 'leaves':
        ctx.fillStyle = colors.leaves;
        // 左侧叶片
        ctx.beginPath();
        ctx.ellipse(-20, -100, 35, 14, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // 右侧叶片
        ctx.beginPath();
        ctx.ellipse(18, -70, 30, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'petals': {
        ctx.fillStyle = colors.petals;
        const cx = 0, cy = -160;                         // 花心移到茎顶
        const petalLen = 26, petalWid = 12, ringR = 18;  // 花瓣沿半径外移
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.save();
          ctx.translate(cx, cy);                          // 先移到花心
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, -ringR, petalWid, petalLen, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      }
      case 'center': {
        ctx.fillStyle = colors.center;
        ctx.beginPath();
        ctx.arc(0, -160, 10, 0, Math.PI * 2);            // 花蕊也移到茎顶
        ctx.fill();
        break;
      }
    }
  }
}
