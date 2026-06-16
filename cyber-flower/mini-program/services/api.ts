/**
 * 赛博养花 — API请求封装
 * 统一的网络请求层，处理Token、错误、重试
 */

const BASE_URL = 'http://localhost:3000/v1';
const TIMEOUT = 30000;

/** 请求配置 */
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
}

/** API响应格式 */
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

class ApiService {
  private token: string | null = null;
  private refreshingToken = false;
  private pendingQueue: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];

  setToken(token: string): void {
    this.token = token;
    wx.setStorageSync('access_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = wx.getStorageSync('access_token') || null;
    }
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('refresh_token');
  }

  /**
   * 通用请求方法
   */
  async request<T = unknown>(config: RequestConfig): Promise<T> {
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.header,
    };

    if (!config.skipAuth && this.getToken()) {
      header['Authorization'] = `Bearer ${this.getToken()}`;
    }

    try {
      const res = await new Promise<WechatMiniprogram.RequestSuccessCallbackResult>(
        (resolve, reject) => {
          wx.request({
            url: `${BASE_URL}${config.url}`,
            method: config.method || 'GET',
            data: config.data,
            header,
            timeout: config.timeout || TIMEOUT,
            success: resolve,
            fail: reject,
          });
        },
      );

      const apiRes = res.data as ApiResponse<T>;

      if (res.statusCode === 401 && !config.skipAuth) {
        // Token过期，尝试刷新
        await this.refreshToken();
        return this.request<T>(config);
      }

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return apiRes.data;
      }

      throw new Error(apiRes.message || `请求失败: ${res.statusCode}`);
    } catch (error) {
      console.error('[API] Request error:', config.url, error);
      throw error;
    }
  }

  /**
   * 刷新Token
   */
  private async refreshToken(): Promise<void> {
    if (this.refreshingToken) {
      return new Promise((resolve, reject) => {
        this.pendingQueue.push({ resolve, reject });
      });
    }

    this.refreshingToken = true;

    try {
      const refreshToken = wx.getStorageSync('refresh_token');
      if (!refreshToken) throw new Error('No refresh token');

      const res = await this.request<{ accessToken: string; refreshToken: string }>({
        url: '/auth/refresh',
        method: 'POST',
        data: { refreshToken },
        skipAuth: true,
      });

      this.setToken(res.accessToken);
      wx.setStorageSync('refresh_token', res.refreshToken);

      // 重放等待队列
      this.pendingQueue.forEach((p) => p.resolve());
      this.pendingQueue = [];
    } catch (error) {
      this.pendingQueue.forEach((p) => p.reject(error as Error));
      this.pendingQueue = [];
      this.clearToken();
      throw error;
    } finally {
      this.refreshingToken = false;
    }
  }

  // ============ 便捷方法 ============

  get<T = unknown>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  post<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  patch<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: Omit<RequestConfig, 'url' | 'method' | 'data'>,
  ): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  delete<T = unknown>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
}

export const api = new ApiService();
export default api;
