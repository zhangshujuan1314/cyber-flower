/**
 * 赛博养花 — 认证服务
 * 微信登录 + 用户信息管理
 */

import api from './api';

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  gardenLevel: number;
  stats: {
    totalFlowers: number;
    currentFlowers: number;
    collectionCount: number;
    careStreak: number;
  };
}

class AuthService {
  /**
   * 微信一键登录
   */
  async login(): Promise<UserInfo> {
    // 1. 获取微信登录code
    const loginRes = await wx.login();
    if (!loginRes.code) {
      throw new Error('微信登录失败');
    }

    // 2. 后端换取Token
    const result = await api.post<LoginResult>('/auth/login', {
      code: loginRes.code,
    });

    api.setToken(result.accessToken);
    wx.setStorageSync('refresh_token', result.refreshToken);

    return result.user;
  }

  /**
   * 获取用户信息（需要用户授权）
   */
  async getUserProfile(): Promise<WechatMiniprogram.UserInfo> {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于创建你的花园昵称和头像',
        success: (res) => resolve(res.userInfo),
        fail: reject,
      });
    });
  }

  /**
   * 更新用户资料
   */
  async updateProfile(data: { nickname?: string; avatar?: string }): Promise<void> {
    await api.patch('/auth/profile', data as unknown as Record<string, unknown>);
  }

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    api.clearToken();
    wx.clearStorageSync();
  }

  /**
   * 检查登录状态
   */
  isLoggedIn(): boolean {
    return !!api.getToken();
  }
}

export const authService = new AuthService();
export default authService;
