import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators';
import { CommentGardenDto } from '../../shared/dto';

@ApiTags('Social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('friends')
  @ApiOperation({ summary: '获取好友列表' })
  async getFriends(@CurrentUserId() userId: string) {
    return this.socialService.getFriends(userId);
  }

  @Post('friends/:friendId')
  @ApiOperation({ summary: '添加好友' })
  async addFriend(@CurrentUserId() userId: string, @Param('friendId') friendId: string) {
    return this.socialService.addFriend(userId, friendId);
  }

  @Delete('friends/:friendId')
  @ApiOperation({ summary: '移除好友' })
  async removeFriend(@CurrentUserId() userId: string, @Param('friendId') friendId: string) {
    await this.socialService.removeFriend(userId, friendId);
    return { message: '已移除' };
  }

  @Get('garden/:userId')
  @ApiOperation({ summary: '访问好友花园' })
  async visitGarden(@CurrentUserId() visitorId: string, @Param('userId') hostId: string) {
    return this.socialService.visitGarden(visitorId, hostId);
  }

  @Post('garden/:userId/like')
  @ApiOperation({ summary: '点赞花园' })
  async likeGarden(@CurrentUserId() visitorId: string, @Param('userId') hostId: string) {
    return this.socialService.likeGarden(visitorId, hostId);
  }

  @Post('garden/:userId/comment')
  @ApiOperation({ summary: '留言' })
  async commentGarden(
    @CurrentUserId() visitorId: string,
    @Param('userId') hostId: string,
    @Body() dto: CommentGardenDto,
  ) {
    return this.socialService.commentGarden(visitorId, hostId, dto.text);
  }

  @Get('notifications')
  @ApiOperation({ summary: '获取未读通知' })
  async notifications(@CurrentUserId() userId: string) {
    return this.socialService.getNotifications(userId);
  }
}
