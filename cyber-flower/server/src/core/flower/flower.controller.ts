import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FlowerService } from './flower.service';
import { PlantFlowerDto, CareFlowerDto, UpdateFlowerDto } from '../../shared/dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators';

@ApiTags('Flowers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('flowers')
export class FlowerController {
  constructor(private readonly flowerService: FlowerService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户所有花朵' })
  async myFlowers(@CurrentUserId() userId: string) {
    return this.flowerService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取花朵详情' })
  async getFlower(@Param('id') id: string) {
    return this.flowerService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '种植新花朵' })
  async plantFlower(@CurrentUserId() userId: string, @Body() dto: PlantFlowerDto) {
    return this.flowerService.create({ ...dto, userId });
  }

  @Post(':id/care')
  @ApiOperation({ summary: '照料操作 (浇水/施肥/修剪/光照)' })
  async care(@Param('id') id: string, @CurrentUserId() userId: string, @Body() dto: CareFlowerDto) {
    return this.flowerService.care(id, userId, dto.action as never, dto.value);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: '获取生长时间线' })
  async getTimeline(@Param('id') id: string) {
    return this.flowerService.getTimeline(id);
  }

  @Get(':id/care-history')
  @ApiOperation({ summary: '获取照料历史' })
  async getCareHistory(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.flowerService.getCareHistory(id, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新花朵信息 (昵称/备注/收藏)' })
  async updateFlower(@Param('id') id: string, @CurrentUserId() userId: string, @Body() dto: UpdateFlowerDto) {
    return this.flowerService.update(id, userId, dto as never);
  }

  @Delete(':id')
  @ApiOperation({ summary: '移除花朵' })
  async removeFlower(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.flowerService.remove(id, userId);
    return { message: '已移除' };
  }
}
