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
    // Check if an alert rule already exists for this user, ticker, and rule type
    const existingRule = await this.prisma.alertRule.findFirst({
      where: {
        userId,
        ticker: input.ticker,
        ruleType: input.ruleType,
      },
    });

    if (existingRule) {
      console.log(
        `Alert rule already exists for user ${userId}, ticker ${input.ticker}, type ${input.ruleType}`,
      );
      return existingRule;
    }

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
        // Check if we've already sent an alert for this rule recently (within last 2 minutes)
        // to prevent duplicate alerts for the same price movement
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const recentAlert = await this.prisma.alertSent.findFirst({
          where: {
            ruleId: rule.id,
            sentAt: {
              gte: twoMinutesAgo,
            },
          },
          orderBy: {
            sentAt: 'desc',
          },
        });

        // If we have a recent alert for this rule, skip to prevent duplicates
        if (recentAlert) {
          console.log(
            `Skipping duplicate alert for rule ${rule.id} - recent alert exists within 2 minutes`,
          );
          continue;
        }

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
