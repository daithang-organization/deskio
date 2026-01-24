import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get('/healthz')
  healthz() {
    return { 
      status: 'ok',
      service: this.config.get('SERVICE_NAME'),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/readyz')
  readyz() {
    // Add checks for database, redis, etc when needed
    return { 
      status: 'ready',
      checks: {
        // database: 'ok',
        // redis: 'ok',
      }
    };
  }
}
