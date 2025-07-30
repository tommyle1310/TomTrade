import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PortfolioPnLService {
  constructor(private prisma: PrismaService) {}

  async calculatePortfolioPnL(
    userId: string,
    currentPrices: Record<string, number>,
  ) {
    const portfolio = await this.prisma.portfolio.findMany({
      where: { userId },
    });

    const balance = await this.prisma.balance.findUnique({
      where: { userId },
    });

    let totalPortfolioValue = 0;
    let totalUnrealizedPnL = 0;
    const positions: Array<{
      ticker: string;
      quantity: number;
      averagePrice: number;
      currentPrice: number;
      marketValue: number;
      unrealizedPnL: number;
      pnlPercentage: number;
    }> = [];

    for (const position of portfolio) {
      const currentPrice = currentPrices[position.ticker] || 0;
      const marketValue = position.quantity * currentPrice;
      const unrealizedPnL =
        (currentPrice - position.averagePrice) * position.quantity;
      const pnlPercentage =
        position.averagePrice > 0
          ? ((currentPrice - position.averagePrice) / position.averagePrice) *
            100
          : 0;

      totalPortfolioValue += marketValue;
      totalUnrealizedPnL += unrealizedPnL;

      positions.push({
        ticker: position.ticker,
        quantity: position.quantity,
        averagePrice: position.averagePrice,
        currentPrice,
        marketValue,
        unrealizedPnL,
        pnlPercentage,
      });
    }

    // Calculate realized P&L from transactions
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    let totalRealizedPnL = 0;
    const tickerTransactions: Record<
      string,
      { buys: number[]; sells: number[] }
    > = {};

    // Group transactions by ticker
    for (const tx of transactions) {
      if (!tickerTransactions[tx.ticker]) {
        tickerTransactions[tx.ticker] = { buys: [], sells: [] };
      }

      if (tx.action === 'BUY') {
        tickerTransactions[tx.ticker].buys.push(tx.price);
      } else {
        tickerTransactions[tx.ticker].sells.push(tx.price);
      }
    }

    // Calculate realized P&L for each ticker
    for (const [ticker, txs] of Object.entries(tickerTransactions)) {
      const realizedPnL = this.calculateRealizedPnL(txs.buys, txs.sells);
      totalRealizedPnL += realizedPnL;
    }

    const totalPnL = totalUnrealizedPnL + totalRealizedPnL;
    const totalAssets = totalPortfolioValue + (balance?.amount || 0);

    return {
      totalPortfolioValue,
      totalUnrealizedPnL,
      totalRealizedPnL,
      totalPnL,
      totalAssets,
      balance: balance?.amount || 0,
      positions,
    };
  }

  private calculateRealizedPnL(buys: number[], sells: number[]): number {
    // Simple FIFO calculation for realized P&L
    let realizedPnL = 0;
    const buyQueue = [...buys];
    const sellQueue = [...sells];

    for (const sellPrice of sellQueue) {
      if (buyQueue.length > 0) {
        const buyPrice = buyQueue.shift()!;
        realizedPnL += sellPrice - buyPrice;
      }
    }

    return realizedPnL;
  }

  async getPortfolioSummary(
    userId: string,
    currentPrices: Record<string, number>,
  ) {
    const pnlData = await this.calculatePortfolioPnL(userId, currentPrices);

    return {
      totalValue: pnlData.totalPortfolioValue,
      totalPnL: pnlData.totalPnL,
      totalUnrealizedPnL: pnlData.totalUnrealizedPnL,
      totalRealizedPnL: pnlData.totalRealizedPnL,
      totalAssets: pnlData.totalAssets,
      balance: pnlData.balance,
      positions: pnlData.positions,
      pnlPercentage:
        pnlData.totalPortfolioValue > 0
          ? (pnlData.totalPnL / pnlData.totalPortfolioValue) * 100
          : 0,
    };
  }

  async getPositionPnL(userId: string, ticker: string, currentPrice: number) {
    const position = await this.prisma.portfolio.findUnique({
      where: { userId_ticker: { userId, ticker } },
    });

    if (!position) {
      return null;
    }

    const marketValue = position.quantity * currentPrice;
    const unrealizedPnL =
      (currentPrice - position.averagePrice) * position.quantity;
    const pnlPercentage =
      position.averagePrice > 0
        ? ((currentPrice - position.averagePrice) / position.averagePrice) * 100
        : 0;

    return {
      ticker,
      quantity: position.quantity,
      averagePrice: position.averagePrice,
      currentPrice,
      marketValue,
      unrealizedPnL,
      pnlPercentage,
    };
  }
}
