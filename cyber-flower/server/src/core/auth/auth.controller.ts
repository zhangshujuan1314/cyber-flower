import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '微信登录' })
  async login(@Body('code') code: string) {
    return this.authService.wxLogin(code);
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新Token' })
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshToken(token);
  }
}
