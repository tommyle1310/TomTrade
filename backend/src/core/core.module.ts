// src/core/core.module.ts
import { Global, Module } from '@nestjs/common';
import { SocketService } from 'src/core/socket-gateway.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  providers: [SocketService, ConfigService, JwtService],
  exports: [SocketService, ConfigService, JwtService],
})
export class CoreModule {}
