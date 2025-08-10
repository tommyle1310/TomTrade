import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateAlertRuleInput,
  AlertRuleType,
} from './dto/create-alert-rule.input';

@Injectable()
export class AlertRuleService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, input: CreateAlertRuleInput) {
    return this.prisma.alertRule.create({
      data: {
        ...input,
        userId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.alertRule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(userId: string, id: string) {
    const rule = await this.prisma.alertRule.findFirst({
      where: { id, userId },
    });

    if (!rule) {
      throw new NotFoundException(`Alert rule with ID "${id}" not found.`);
    }

    await this.prisma.alertRule.delete({ where: { id } });
    return true;
  }

  async checkAndTrigger(ticker: string, price: number) {
    const rules = await this.prisma.alertRule.findMany({ where: { ticker } });
    const alerts: { userId: string; data: any }[] = [];

    for (const rule of rules) {
      let triggered = false;
      if (
        rule.ruleType === AlertRuleType.PRICE_ABOVE &&
        price > rule.targetValue
      )
        triggered = true;
      if (
        rule.ruleType === AlertRuleType.PRICE_BELOW &&
        price < rule.targetValue
      )
        triggered = true;

      if (triggered) {
        const alertSent = await this.prisma.alertSent.create({
          data: {
            ruleId: rule.id,
            userId: rule.userId,
            ticker: rule.ticker,
            deliveryMethod: 'SOCKET',
          },
        });

        alerts.push({
          userId: rule.userId,
          data: {
            message: `Alert for ${rule.ticker}: Price is now ${price}`,
            alert: alertSent,
          },
        });
      }
    }

    return alerts;
  }
}
