import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeasonService } from './season.service';

@ApiTags('Season')
@Controller('garden')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('season')
  @ApiOperation({ summary: '获取当前节气信息' })
  getSeason() {
    return this.seasonService.getCurrentTerm();
  }
}
