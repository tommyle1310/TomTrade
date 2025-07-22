import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  getByUser(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
    });
  }

  async upsertPortfolio(
    tx: Prisma.TransactionClient,
    userId: string,
    ticker: string,
    shares: number,
    price: number,
  ) {
    const existingPortfolio = await tx.portfolio.findFirst({
      where: { userId, ticker },
    });

    if (existingPortfolio) {
      const newQuantity = existingPortfolio.quantity + shares;
      const newAveragePrice =
        (existingPortfolio.averagePrice * existingPortfolio.quantity + price * shares) /
        newQuantity;

      return tx.portfolio.update({
        where: { id: existingPortfolio.id },
        data: {
          quantity: newQuantity,
          averagePrice: newAveragePrice,
        },
      });
    } else {
      return tx.portfolio.create({
        data: {
          userId,
          ticker,
          quantity: shares,
          averagePrice: price,
          positionType: 'LONG',
        },
      });
    }
  }

  async updatePortfolioOnSell(
    tx: Prisma.TransactionClient,
    userId: string,
    ticker: string,
    shares: number,
  ) {
    const existing = await tx.portfolio.findFirst({
      where: { userId, ticker },
    });
  
    if (!existing) throw new NotFoundException('Portfolio not found');
  
    const remaining = existing.quantity - shares;
  
    if (remaining <= 0) {
      await tx.portfolio.delete({
        where: { id: existing.id },
      });
      return null;
    }
  
    return tx.portfolio.update({
      where: { id: existing.id },
      data: { quantity: remaining },
    });
  }
}
