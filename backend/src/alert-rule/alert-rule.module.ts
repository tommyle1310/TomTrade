import { Module } from '@nestjs/common';
import { AlertRuleService } from './alert-rule.service';
import { AlertRuleResolver } from './alert-rule.resolver';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AlertRuleResolver, AlertRuleService],
  exports: [AlertRuleService],
})
export class AlertRuleModule {}
