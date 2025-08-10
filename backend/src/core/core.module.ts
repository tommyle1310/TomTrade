// src/core/core.module.ts
import { Global, Module } from '@nestjs/common';
import { SocketService } from 'src/core/socket-gateway.service';

@Global()
@Module({
  providers: [SocketService],
  exports: [SocketService],
})
export class CoreModule {}
