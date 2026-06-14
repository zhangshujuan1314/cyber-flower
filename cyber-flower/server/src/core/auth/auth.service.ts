import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async wxLogin(code: string) {
    const appId = process.env.WX_APPID || '';
    const appSecret = process.env.WX_SECRET || '';

    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: { appid: appId, secret: appSecret, js_code: code, grant_type: 'authorization_code' },
    });

    if (wxRes.data.errcode) {
      throw new UnauthorizedException(`微信登录失败: ${wxRes.data.errmsg}`);
    }

    const { openid, unionid } = wxRes.data;
    const user = await this.userService.findOrCreate(openid, unionid);

    const accessToken = this.jwtService.sign({ sub: user._id, type: 'access' });
    const refreshToken = this.jwtService.sign({ sub: user._id, type: 'refresh' }, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        gardenLevel: user.stats.gardenLevel,
        stats: user.stats,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'refresh') throw new Error('Invalid token type');
      return {
        accessToken: this.jwtService.sign({ sub: payload.sub, type: 'access' }),
        refreshToken: this.jwtService.sign({ sub: payload.sub, type: 'refresh' }, { expiresIn: '30d' }),
      };
    } catch {
      throw new UnauthorizedException('Token无效或已过期');
    }
  }
}
