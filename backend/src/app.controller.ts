import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    const instanceId = process.env.INSTANCE_ID || 'unknown';
    return `${this.appService.getHello()} - Served by: ${instanceId}`;
  }

  @Get('health')
  getHealth(): object {
    const instanceId = process.env.INSTANCE_ID || 'unknown';
    return {
      status: 'ok',
      instance: instanceId,
      timestamp: new Date().toISOString(),
    };
  }
}
