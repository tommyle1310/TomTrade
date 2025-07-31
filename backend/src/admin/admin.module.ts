import { Module } from '@nestjs/common';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [AdminResolver, AdminService, RolesGuard],
  exports: [RolesGuard],
})
export class AdminModule {}
