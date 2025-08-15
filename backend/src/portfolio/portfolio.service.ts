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
    try {
      const existingPortfolio = await tx.portfolio.findFirst({
        where: { userId, ticker },
      });

      if (existingPortfolio) {
        const newQuantity = existingPortfolio.quantity + shares;
        const newAveragePrice =
          (existingPortfolio.averagePrice * existingPortfolio.quantity +
            price * shares) /
          newQuantity;

        const updated = await tx.portfolio.update({
          where: { id: existingPortfolio.id },
          data: {
            quantity: newQuantity,
            averagePrice: newAveragePrice,
          },
        });

        console.log(
          `📊 Portfolio updated for ${userId} ${ticker}: ${existingPortfolio.quantity} + ${shares} = ${newQuantity} @ avg $${newAveragePrice.toFixed(2)}`,
        );
        return updated;
      } else {
        const created = await tx.portfolio.create({
          data: {
            userId,
            ticker,
            quantity: shares,
            averagePrice: price,
            positionType: 'LONG',
          },
        });

        console.log(
          `📊 Portfolio created for ${userId} ${ticker}: ${shares} @ $${price}`,
        );
        return created;
      }
    } catch (error) {
      console.error(
        `❌ Error upserting portfolio for ${userId} ${ticker}:`,
        error,
      );
      throw error;
    }
  }

  async updatePortfolioOnSell(
    tx: Prisma.TransactionClient,
    userId: string,
    ticker: string,
    shares: number,
  ) {
    try {
      const existing = await tx.portfolio.findFirst({
        where: { userId, ticker },
      });

      if (!existing) {
        console.error(`❌ Portfolio not found for ${userId} ${ticker}`);
        throw new NotFoundException('Portfolio not found');
      }

      const remaining = existing.quantity - shares;
      console.log(
        `📊 Selling ${shares} shares of ${ticker} for ${userId}: ${existing.quantity} - ${shares} = ${remaining}`,
      );

      if (remaining <= 0) {
        await tx.portfolio.delete({
          where: { id: existing.id },
        });
        console.log(`📊 Portfolio position closed for ${userId} ${ticker}`);
        return null;
      }

      const updated = await tx.portfolio.update({
        where: { id: existing.id },
        data: { quantity: remaining },
      });

      console.log(
        `📊 Portfolio updated for ${userId} ${ticker}: remaining ${remaining} shares`,
      );
      return updated;
    } catch (error) {
      console.error(
        `❌ Error updating portfolio on sell for ${userId} ${ticker}:`,
        error,
      );
      throw error;
    }
  }

  async addStock(
    userId: string,
    ticker: string,
    quantity: number,
    executedPrice: number,
  ) {
    const existing = await this.prisma.portfolio.findUnique({
      where: { userId_ticker: { userId, ticker } },
    });

    if (existing) {
      const newTotalQty = existing.quantity + quantity;
      const newAvgPrice =
        (existing.averagePrice * existing.quantity + executedPrice * quantity) /
        newTotalQty;

      await this.prisma.portfolio.update({
        where: { userId_ticker: { userId, ticker } },
        data: {
          quantity: { increment: quantity },
          averagePrice: newAvgPrice,
        },
      });
    } else {
      await this.prisma.portfolio.create({
        data: {
          userId,
          ticker,
          quantity,
          averagePrice: executedPrice,
          positionType: 'LONG',
        },
      });
    }
  }

  async removeStock(userId: string, ticker: string, quantity: number) {
    await this.prisma.portfolio.update({
      where: { userId_ticker: { userId, ticker } },
      data: { quantity: { decrement: quantity } },
    });
  }

  async increase(
    userId: string,
    ticker: string,
    quantity: number,
    price: number,
  ) {
    const existing = await this.prisma.portfolio.findUnique({
      where: { userId_ticker: { userId, ticker } },
    });

    if (!existing) {
      return this.prisma.portfolio.create({
        data: {
          userId,
          ticker,
          quantity,
          averagePrice: price,
          positionType: 'LONG',
        },
      });
    }

    const totalCost =
      existing.averagePrice * existing.quantity + price * quantity;
    const newQuantity = existing.quantity + quantity;
    const newAvg = totalCost / newQuantity;

    return this.prisma.portfolio.update({
      where: { userId_ticker: { userId, ticker } },
      data: {
        quantity: newQuantity,
        averagePrice: newAvg,
      },
    });
  }

  async decrease(userId: string, ticker: string, quantity: number) {
    const existing = await this.prisma.portfolio.findUnique({
      where: { userId_ticker: { userId, ticker } },
    });

    if (!existing || existing.quantity < quantity) {
      throw new Error('Not enough shares to sell.');
    }

    return this.prisma.portfolio.update({
      where: { userId_ticker: { userId, ticker } },
      data: {
        quantity: { decrement: quantity },
      },
    });
  }
}
