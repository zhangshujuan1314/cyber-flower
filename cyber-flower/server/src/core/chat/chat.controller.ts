import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from '../../shared/dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':flowerId/send')
  @ApiOperation({ summary: '发送消息给花朵' })
  async send(@Param('flowerId') flowerId: string, @CurrentUserId() userId: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(flowerId, userId, dto.message);
  }

  @Get(':flowerId/history')
  @ApiOperation({ summary: '获取对话历史' })
  async history(@Param('flowerId') flowerId: string) {
    return this.chatService.getHistory(flowerId);
  }

  @Delete(':flowerId/history')
  @ApiOperation({ summary: '清除对话历史' })
  async clear(@Param('flowerId') flowerId: string) {
    await this.chatService.clearHistory(flowerId);
    return { message: '已清除' };
  }
}
