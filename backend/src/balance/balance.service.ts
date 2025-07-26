import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class BalanceService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    const balance = await this.prisma.balance.findUnique({
      where: { userId },
    });

    return balance?.amount ?? 0;
  }

  async getBalance(userId: string): Promise<number> {
    const balance = await this.prisma.balance.findUnique({
      where: { userId },
    });
    return balance?.amount ?? 0;
  }

  async deposit(userId: string, amount: number): Promise<boolean> {
    await this.prisma.balance.upsert({
      where: { userId },
      update: { amount: { increment: amount } },
      create: { userId, amount },
    });
    return true;
  }

  async deduct(userId: string, amount: number) {
    return this.prisma.balance.update({
      where: { userId },
      data: { amount: { decrement: amount } },
    });
  }

  async add(userId: string, amount: number) {
    return this.prisma.balance.update({
      where: { userId },
      data: { amount: { increment: amount } },
    });
  }
}
