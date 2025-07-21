import { Injectable } from '@nestjs/common';
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
    const existingPortfolio = await tx.portfolio.findFirst({
      where: { userId, ticker },
    });

    if (!existingPortfolio) {
      // This case should be handled in the transaction service, but as a safeguard:
      throw new Error('Portfolio not found for sell operation.');
    }

    const newQuantity = existingPortfolio.quantity - shares;

    if (newQuantity > 0) {
      return tx.portfolio.update({
        where: { id: existingPortfolio.id },
        data: { quantity: newQuantity },
      });
    } else {
      // If all shares are sold, remove the portfolio entry
      return tx.portfolio.delete({ where: { id: existingPortfolio.id } });
    }
  }
}
