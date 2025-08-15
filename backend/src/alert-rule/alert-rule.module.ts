import { Module } from '@nestjs/common';
import { AlertRuleService } from './alert-rule.service';
import { AlertRuleResolver } from './alert-rule.resolver';
import { AlertDispatcherService } from './alert-dispatcher.service';
import { PrismaModule } from 'prisma/prisma.module';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [PrismaModule, CoreModule],
  providers: [AlertRuleResolver, AlertRuleService, AlertDispatcherService],
  exports: [AlertRuleService, AlertDispatcherService],
})
export class AlertRuleModule {}
