import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('socket-test')
  getSocketTest() {
    return {
      message: 'Socket.IO server should be running',
      timestamp: new Date().toISOString(),
      note: 'Check the console logs for Socket.IO initialization',
    };
  }
}
