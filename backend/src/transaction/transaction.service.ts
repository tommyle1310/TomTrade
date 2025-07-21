import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { BuyStockInput, SellStockInput } from './dto/transaction.input';
import { TransactionAction } from './enums/transaction-action';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private portfolioService: PortfolioService,
  ) {}

  getByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async buyStock(userId: string, input: BuyStockInput) {
    const { ticker, shares, price } = input;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          ticker,
          shares,
          price,
          action: TransactionAction.BUY,
        },
      });

      // 2. Find or create portfolio entry
      const portfolio = await this.portfolioService.upsertPortfolio(
        tx,
        userId,
        ticker,
        shares,
        price,
      );

      return { transaction, portfolio };
    });
  }

  async sellStock(userId: string, input: SellStockInput) {
    const { ticker, shares, price } = input;

    return this.prisma.$transaction(async (tx) => {
      // 1. Check if user has enough shares to sell
      const portfolio = await tx.portfolio.findFirst({
        where: { userId, ticker },
      });

      if (!portfolio || portfolio.quantity < shares) {
        throw new NotFoundException('Insufficient shares to sell.');
      }

      // 2. Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          ticker,
          shares,
          price,
          action: TransactionAction.SELL,
        },
      });

      // 3. Update portfolio
      const updatedPortfolio = await this.portfolioService.updatePortfolioOnSell(
        tx,
        userId,
        ticker,
        shares,
      );

      return { transaction, portfolio: updatedPortfolio };
    });
  }
}
