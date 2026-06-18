import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from '../../shared/dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getMe(@CurrentUserId() userId: string) {
    return this.userService.findById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: '更新当前用户资料' })
  async updateMe(@CurrentUserId() userId: string, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(userId, dto as never);
  }

  @Get('me/stats')
  @ApiOperation({ summary: '获取当前用户统计' })
  async getStats(@CurrentUserId() userId: string) {
    const user = await this.userService.findById(userId);
    return user.stats;
  }
}
