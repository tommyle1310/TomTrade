import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionService } from '../transaction/transaction.service';
import { StockService } from '../stock/stock.service';
import { BalanceService } from '../balance/balance.service';
import { StockPosition } from './entities/stock-position.entity';
import { DashboardResult } from './entities/dashboard-result.entity';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private portfolioService: PortfolioService,
    private transactionService: TransactionService,
    private stockService: StockService,
    private balanceService: BalanceService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResult> {
    // Get user's portfolio positions
    const portfolioPositions = await this.portfolioService.getByUser(userId);

    // Get cash balance
    const cashBalance = await this.balanceService.getBalance(userId);

    // Get current prices for all stocks in portfolio
    const stockPositions: StockPosition[] = [];
    let totalPortfolioValue = 0;
    let totalUnrealizedPnL = 0;

    for (const position of portfolioPositions) {
      // Get current price from latest market data
      const latestMarketData = await this.prisma.marketData.findFirst({
        where: { ticker: position.ticker },
        orderBy: { timestamp: 'desc' },
      });

      const currentPrice = latestMarketData?.close || position.averagePrice;
      const marketValue = position.quantity * currentPrice;
      const unrealizedPnL =
        (currentPrice - position.averagePrice) * position.quantity;
      const unrealizedPnLPercent =
        position.averagePrice > 0
          ? ((currentPrice - position.averagePrice) / position.averagePrice) *
            100
          : 0;

      // Get stock info
      const stock = await this.stockService.getStock(position.ticker);

      const stockPosition = new StockPosition();
      stockPosition.ticker = position.ticker;
      stockPosition.companyName = stock?.companyName || position.ticker;
      // Provide fallback avatar URL if stock doesn't have one
      stockPosition.avatar =
        stock?.avatar ||
        `https://financialmodelingprep.com/image-stock/${position.ticker}.png`;
      stockPosition.quantity = position.quantity;
      stockPosition.averageBuyPrice = position.averagePrice;
      stockPosition.currentPrice = currentPrice;
      stockPosition.marketValue = marketValue;
      stockPosition.unrealizedPnL = unrealizedPnL;
      stockPosition.unrealizedPnLPercent = unrealizedPnLPercent;

      stockPositions.push(stockPosition);

      totalPortfolioValue += marketValue;
      totalUnrealizedPnL += unrealizedPnL;
    }

    // Calculate realized P&L from SELL transactions
    const sellTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        action: 'SELL',
      },
      include: {
        stock: true,
      },
    });

    let totalRealizedPnL = 0;

    for (const transaction of sellTransactions) {
      // Get average buy price for this stock at the time of sale
      const buyTransactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          ticker: transaction.ticker,
          action: 'BUY',
          timestamp: { lte: transaction.timestamp },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Calculate average buy price up to the point of this sale
      let totalSharesBought = 0;
      let totalCost = 0;

      for (const buyTx of buyTransactions) {
        totalSharesBought += buyTx.shares;
        totalCost += buyTx.shares * buyTx.price;
      }

      if (totalSharesBought > 0) {
        const averageBuyPrice = totalCost / totalSharesBought;
        const realizedPnL =
          (transaction.price - averageBuyPrice) * transaction.shares;
        totalRealizedPnL += realizedPnL;
      }
    }

    const totalPnL = totalRealizedPnL + totalUnrealizedPnL;

    const dashboardResult = new DashboardResult();
    dashboardResult.totalPortfolioValue = totalPortfolioValue;
    dashboardResult.totalRealizedPnL = totalRealizedPnL;
    dashboardResult.totalUnrealizedPnL = totalUnrealizedPnL;
    dashboardResult.totalPnL = totalPnL;
    dashboardResult.cashBalance = cashBalance;
    dashboardResult.stockPositions = stockPositions;

    return dashboardResult;
  }

  async getStockPosition(
    userId: string,
    ticker: string,
  ): Promise<StockPosition | null> {
    const position = await this.prisma.portfolio.findFirst({
      where: { userId, ticker },
    });

    if (!position) return null;

    // Get current price
    const latestMarketData = await this.prisma.marketData.findFirst({
      where: { ticker },
      orderBy: { timestamp: 'desc' },
    });

    const currentPrice = latestMarketData?.close || position.averagePrice;
    const marketValue = position.quantity * currentPrice;
    const unrealizedPnL =
      (currentPrice - position.averagePrice) * position.quantity;
    const unrealizedPnLPercent =
      position.averagePrice > 0
        ? ((currentPrice - position.averagePrice) / position.averagePrice) * 100
        : 0;

    // Get stock info
    const stock = await this.stockService.getStock(ticker);

    const stockPosition = new StockPosition();
    stockPosition.ticker = position.ticker;
    stockPosition.companyName = stock?.companyName || position.ticker;
    // Provide fallback avatar URL if stock doesn't have one
    stockPosition.avatar =
      stock?.avatar ||
      `https://financialmodelingprep.com/image-stock/${position.ticker}.png`;
    stockPosition.quantity = position.quantity;
    stockPosition.averageBuyPrice = position.averagePrice;
    stockPosition.currentPrice = currentPrice;
    stockPosition.marketValue = marketValue;
    stockPosition.unrealizedPnL = unrealizedPnL;
    stockPosition.unrealizedPnLPercent = unrealizedPnLPercent;

    return stockPosition;
  }
}
