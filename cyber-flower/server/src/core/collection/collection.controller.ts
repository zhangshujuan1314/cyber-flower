import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Collection')
@ApiBearerAuth()
@Controller('collection')
export class CollectionController {
  @Get()
  async getCollection(@Query('userId') userId: string) {
    return { flowers: [], collected: 0, total: 48 };
  }
}
