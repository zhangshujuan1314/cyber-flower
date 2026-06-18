/**
 * 赛博养花 — 性能工具
 * 图片优化、内存管理、帧率监控
 */

/** 图片加载管理器 — 渐进式加载 + 内存回收 */
export class ImageLoader {
  private cache: Map<string, string> = new Map();
  private loading: Set<string> = new Set();
  private maxCacheSize = 30;

  /**
   * 渐进式加载: 先低清→后高清
   */
  async loadProgressive(lowResUrl: string, highResUrl: string): Promise<string> {
    // 先返回低清
    if (this.cache.has(lowResUrl)) return this.cache.get(lowResUrl)!;

    // 后台加载高清
    if (!this.loading.has(highResUrl)) {
      this.loading.add(highResUrl);
      wx.downloadFile({
        url: highResUrl,
        success: (res) => {
          this.cache.set(highResUrl, res.tempFilePath);
          this.loading.delete(highResUrl);
          this.evictIfNeeded();
        },
        fail: () => this.loading.delete(highResUrl),
      });
    }

    return lowResUrl;
  }

  /** 预加载图片列表 */
  async preload(urls: string[]): Promise<void> {
    const tasks = urls
      .filter((url) => !this.cache.has(url) && !this.loading.has(url))
      .map((url) => {
        this.loading.add(url);
        return new Promise<void>((resolve) => {
          wx.downloadFile({
            url,
            success: (res) => {
              this.cache.set(url, res.tempFilePath);
              this.loading.delete(url);
              resolve();
            },
            fail: () => {
              this.loading.delete(url);
              resolve();
            },
          });
        });
      });

    await Promise.allSettled(tasks);
    this.evictIfNeeded();
  }

  /** 获取缓存的图片 */
  get(url: string): string | undefined {
    return this.cache.get(url);
  }

  /** 清除缓存 */
  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }

  private evictIfNeeded(): void {
    if (this.cache.size > this.maxCacheSize) {
      const keys = Array.from(this.cache.keys());
      for (let i = 0; i < keys.length - this.maxCacheSize; i++) {
        this.cache.delete(keys[i]);
      }
    }
  }
}

/** 帧率监控 */
export class FpsMonitor {
  private frames = 0;
  private lastTime = Date.now();
  private fps = 60;
  private running = false;

  start(): void {
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
  }

  getFps(): number {
    return this.fps;
  }

  private tick(): void {
    if (!this.running) return;
    this.frames++;
    const now = Date.now();
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round(this.frames / ((now - this.lastTime) / 1000));
      this.frames = 0;
      this.lastTime = now;
    }
    // 使用setTimeout模拟requestAnimationFrame
    setTimeout(() => this.tick(), 16);
  }
}

/** 首屏性能上报 */
export function reportPerformance(): void {
  const performance = wx.getPerformance();
  const observer = performance.createObserver((entryList) => {
    const entries = entryList.getEntries();
    for (const entry of entries) {
      if (entry.entryType === 'navigation') {
        const nav = entry as { domComplete?: number; responseEnd?: number };
        console.log('[Perf] Page load:', {
          domComplete: nav.domComplete,
          responseEnd: nav.responseEnd,
        });
      }
    }
  });
  observer.observe({ entryTypes: ['navigation', 'render', 'script'] });
}

/** 内存警告处理 */
export function watchMemory(): void {
  wx.onMemoryWarning((res) => {
    console.warn('[Perf] Memory warning:', res.level);
    // 清除图片缓存
    if (res.level >= 10) {
      imageLoader.clear();
    }
  });
}

export const imageLoader = new ImageLoader();
