import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BreedService } from './breed.service';
import { GenerateSeedDto, PlantSeedDto, GiftSeedDto } from '../../shared/dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators';

@ApiTags('Breed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @Post('seeds/generate')
  @ApiOperation({ summary: 'AI关键词生成种子' })
  async generate(@CurrentUserId() userId: string, @Body() dto: GenerateSeedDto) {
    return this.breedService.generateFromKeyword(userId, dto.keyword, dto.mood);
  }

  @Get('seeds/daily')
  @ApiOperation({ summary: '获取每日种子' })
  async daily(@CurrentUserId() userId: string) {
    return this.breedService.getDailySeeds(userId);
  }

  @Get('seeds')
  @ApiOperation({ summary: '获取我的种子列表' })
  async mySeeds(@CurrentUserId() userId: string) {
    return this.breedService.getUserSeeds(userId);
  }

  @Post('seeds/:id/plant')
  @ApiOperation({ summary: '种植种子' })
  async plant(@Param('id') id: string, @CurrentUserId() userId: string, @Body() dto: PlantSeedDto) {
    return this.breedService.plantSeed(id, userId);
  }

  @Post('seeds/:id/gift')
  @ApiOperation({ summary: '赠送种子给好友' })
  async gift(@Param('id') id: string, @CurrentUserId() userId: string, @Body() dto: GiftSeedDto) {
    return this.breedService.giftSeed(id, userId, dto.toUserId);
  }
}
