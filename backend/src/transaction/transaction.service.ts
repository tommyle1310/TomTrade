import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { BuyStockInput, SellStockInput } from './dto/transaction.input';
import { TransactionAction } from '@prisma/client';
import { Prisma, Order } from '@prisma/client';
import {
  TransactionPaginationInput,
  UserTransactionPaginationInput,
} from './dto/transaction-admin.input';
import {
  TransactionPaginationResponse,
  TransactionStats,
} from './entities/transaction-admin.entity';

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

  // Admin methods for transaction monitoring
  async getAllTransactionsWithPagination(
    input: TransactionPaginationInput,
  ): Promise<TransactionPaginationResponse> {
    const { page, limit, ticker, action, userId, startDate, endDate } = input;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TransactionWhereInput = {};

    if (ticker) {
      where.ticker = { contains: ticker, mode: 'insensitive' };
    }

    if (action) {
      where.action = action as TransactionAction;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Get transactions with user info
    const [transactions, totalCount] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Get aggregated stats
    const [buyStats, sellStats] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, action: TransactionAction.BUY },
        _sum: { shares: true, price: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, action: TransactionAction.SELL },
        _sum: { shares: true, price: true },
        _count: true,
      }),
    ]);

    // Calculate totals
    const totalBuyAmount =
      (buyStats._sum.shares || 0) * (buyStats._sum.price || 0);
    const totalSellAmount =
      (sellStats._sum.shares || 0) * (sellStats._sum.price || 0);
    const totalAmount = totalBuyAmount + totalSellAmount;

    // Transform transactions to include totalAmount
    const transactionsWithAmount = transactions.map((tx) => ({
      ...tx,
      totalAmount: tx.shares * tx.price,
      user: {
        ...tx.user,
        name: tx.user.name || null, // Ensure null instead of undefined
      },
    }));

    return {
      transactions: transactionsWithAmount,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
        totalAmount,
        totalBuyAmount,
        totalSellAmount,
        totalBuyCount: buyStats._count,
        totalSellCount: sellStats._count,
      },
    };
  }

  async getUserTransactionsWithPagination(
    input: UserTransactionPaginationInput,
  ): Promise<TransactionPaginationResponse> {
    const { userId, page, limit, ticker, action, startDate, endDate } = input;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TransactionWhereInput = { userId };

    if (ticker) {
      where.ticker = { contains: ticker, mode: 'insensitive' };
    }

    if (action) {
      where.action = action as TransactionAction;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Get transactions with user info
    const [transactions, totalCount] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Get aggregated stats for this user
    const [buyStats, sellStats] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, action: TransactionAction.BUY },
        _sum: { shares: true, price: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, action: TransactionAction.SELL },
        _sum: { shares: true, price: true },
        _count: true,
      }),
    ]);

    // Calculate totals
    const totalBuyAmount =
      (buyStats._sum.shares || 0) * (buyStats._sum.price || 0);
    const totalSellAmount =
      (sellStats._sum.shares || 0) * (sellStats._sum.price || 0);
    const totalAmount = totalBuyAmount + totalSellAmount;

    // Transform transactions to include totalAmount
    const transactionsWithAmount = transactions.map((tx) => ({
      ...tx,
      totalAmount: tx.shares * tx.price,
      user: {
        ...tx.user,
        name: tx.user.name || null, // Ensure null instead of undefined
      },
    }));

    return {
      transactions: transactionsWithAmount,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
        totalAmount,
        totalBuyAmount,
        totalSellAmount,
        totalBuyCount: buyStats._count,
        totalSellCount: sellStats._count,
      },
    };
  }

  async getTransactionStats(): Promise<TransactionStats> {
    const [
      totalStats,
      buyStats,
      sellStats,
      uniqueUsers,
      uniqueStocks,
      averagePrice,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        _count: true,
        _sum: { shares: true, price: true },
      }),
      this.prisma.transaction.aggregate({
        where: { action: TransactionAction.BUY },
        _sum: { shares: true, price: true },
      }),
      this.prisma.transaction.aggregate({
        where: { action: TransactionAction.SELL },
        _sum: { shares: true, price: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['userId'],
        _count: true,
      }),
      this.prisma.transaction.groupBy({
        by: ['ticker'],
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        _avg: { price: true },
      }),
    ]);

    const totalVolume =
      (totalStats._sum.shares || 0) * (totalStats._sum.price || 0);
    const totalBuyVolume =
      (buyStats._sum.shares || 0) * (buyStats._sum.price || 0);
    const totalSellVolume =
      (sellStats._sum.shares || 0) * (sellStats._sum.price || 0);

    return {
      totalTransactions: totalStats._count,
      totalVolume,
      totalBuyVolume,
      totalSellVolume,
      uniqueUsers: uniqueUsers.length,
      uniqueStocks: uniqueStocks.length,
      averagePrice: averagePrice._avg.price || 0,
    };
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
      const updatedPortfolio =
        await this.portfolioService.updatePortfolioOnSell(
          tx,
          userId,
          ticker,
          shares,
        );

      return { transaction, portfolio: updatedPortfolio };
    });
  }

  async executeMatchedOrder(
    order: Order & { quantity: number; side: 'BUY' | 'SELL' },
    executedPrice: number,
    tx: Prisma.TransactionClient,
    matchedAgainst: Order,
  ) {
    const shares = order.quantity;
    const ticker = order.ticker;

    const buyerId = order.side === 'BUY' ? order.userId : matchedAgainst.userId;
    const sellerId =
      order.side === 'SELL' ? order.userId : matchedAgainst.userId;

    const total = shares * executedPrice;

    await tx.balance.update({
      where: { userId: buyerId },
      data: { amount: { decrement: total } },
    });

    await tx.balance.update({
      where: { userId: sellerId },
      data: { amount: { increment: total } },
    });

    await tx.transaction.createMany({
      data: [
        {
          userId: buyerId,
          ticker,
          shares,
          price: executedPrice,
          action: 'BUY',
        },
        {
          userId: sellerId,
          ticker,
          shares,
          price: executedPrice,
          action: 'SELL',
        },
      ],
    });

    await this.portfolioService.upsertPortfolio(
      tx,
      buyerId,
      ticker,
      shares,
      executedPrice,
    );
    console.log(
      `[TX] Matched BUY: ${buyerId} gets ${shares} @ ${executedPrice}`,
    );
    console.log(
      `[TX] Matched SELL: ${sellerId} sells ${shares} @ ${executedPrice}`,
    );

    await this.portfolioService.updatePortfolioOnSell(
      tx,
      sellerId,
      ticker,
      shares,
    );
  }

  async recordTrade(
    tx: Prisma.TransactionClient,
    {
      buyerId,
      sellerId,
      ticker,
      price,
      quantity,
    }: {
      buyerId: string;
      sellerId: string;
      ticker: string;
      price: number;
      quantity: number;
    },
  ) {
    console.log(
      `📝 Recording trade: Buyer ${buyerId}, Seller ${sellerId}, ${quantity} ${ticker} @ ${price}`,
    );

    const now = new Date();

    // CRITICAL FIX: Add unique constraint check to prevent duplicate transactions
    const existingBuyerTx = await tx.transaction.findFirst({
      where: {
        userId: buyerId,
        ticker,
        price,
        shares: quantity,
        action: 'BUY',
        timestamp: {
          gte: new Date(now.getTime() - 1000), // Within 1 second
        },
      },
    });

    const existingSellerTx = await tx.transaction.findFirst({
      where: {
        userId: sellerId,
        ticker,
        price,
        shares: quantity,
        action: 'SELL',
        timestamp: {
          gte: new Date(now.getTime() - 1000), // Within 1 second
        },
      },
    });

    if (existingBuyerTx || existingSellerTx) {
      console.log('⚠️ Duplicate transaction detected, skipping...');
      return;
    }

    await tx.transaction.createMany({
      data: [
        {
          userId: buyerId,
          ticker,
          price,
          shares: quantity,
          action: 'BUY',
          timestamp: now,
        },
        {
          userId: sellerId,
          ticker,
          price,
          shares: quantity,
          action: 'SELL',
          timestamp: now,
        },
      ],
    });

    console.log(`✅ Transactions recorded for both buyer and seller`);
  }
}
