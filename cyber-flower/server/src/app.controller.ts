import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './shared/decorators';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  health() {
    return {
      status: 'ok',
      service: 'cyber-bloom-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'API根信息' })
  root() {
    return {
      name: '赛博养花 API',
      version: '1.0.0',
      docs: '/api/docs',
      health: '/health',
    };
  }
}
