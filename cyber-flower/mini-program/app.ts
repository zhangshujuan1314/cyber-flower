/**
 * 赛博养花 (Cyber Bloom) — 应用入口
 * AI驱动的真实感虚拟养花微信小程序
 */

interface LaunchOptions {
  scene: number;
  query: Record<string, string>;
  shareTicket?: string;
  referrerInfo?: Record<string, unknown>;
}

interface AppGlobalData {
  userInfo: WechatMiniprogram.UserInfo | null;
  token: string | null;
  gardenLoaded: boolean;
  currentSeason: string;
  systemInfo: WechatMiniprogram.SystemInfo | null;
}

App<IAppOption>({
  globalData: {
    userInfo: null,
    token: null,
    gardenLoaded: false,
    currentSeason: 'spring',
    systemInfo: null,
  } as AppGlobalData,

  onLaunch(options: LaunchOptions) {
    console.log('[CyberBloom] App launched', options.scene);

    // 获取系统信息
    this.globalData.systemInfo = wx.getWindowInfo();

    // 检测当前季节
    this.detectCurrentSeason();

    // 检查登录状态
    this.checkLoginStatus();

    // 预加载关键资源
    this.preloadAssets();
  },

  onShow() {
    // 应用进入前台时刷新花园状态
    if (this.globalData.token) {
      this.globalData.gardenLoaded = false;
    }
  },

  /**
   * 根据日期检测当前季节/节气
   */
  detectCurrentSeason(): void {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day < 21)) {
      this.globalData.currentSeason = 'spring';
    } else if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day < 23)) {
      this.globalData.currentSeason = 'summer';
    } else if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day < 21)) {
      this.globalData.currentSeason = 'autumn';
    } else {
      this.globalData.currentSeason = 'winter';
    }

    console.log('[CyberBloom] Current season:', this.globalData.currentSeason);
  },

  /**
   * 检查本地Token有效性
   */
  checkLoginStatus(): void {
    const token = wx.getStorageSync('access_token');
    if (token) {
      this.globalData.token = token;
    }
  },

  /**
   * 预加载关键静态资源
   */
  preloadAssets(): void {
    // 预加载四季背景色值
    const seasonColors = {
      spring: { bg: '#F5F9F5', accent: '#FFB7C5' },
      summer: { bg: '#F0F8F0', accent: '#FFD700' },
      autumn: { bg: '#FFF8F0', accent: '#D2691E' },
      winter: { bg: '#F8FAFB', accent: '#B0C4DE' },
    };

    wx.setStorageSync('seasonColors', seasonColors);
  },
});
