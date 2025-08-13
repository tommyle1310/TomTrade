import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionService } from '../transaction/transaction.service';
import { StockService } from '../stock/stock.service';
import { BalanceService } from '../balance/balance.service';
import { PortfolioPnLService } from '../portfolio/portfolio-pnl.service';
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
    private portfolioPnLService: PortfolioPnLService,
  ) {
    console.log('🔍 DashboardService constructor called');
    console.log('🔍 PortfolioPnLService injected:', !!this.portfolioPnLService);
    console.log('🔍 PortfolioService injected:', !!this.portfolioService);
    console.log('🔍 BalanceService injected:', !!this.balanceService);
  }

  async getDashboard(userId: string): Promise<DashboardResult> {
    console.log(`🔍 DashboardService.getDashboard called for user: ${userId}`);

    try {
      // CRITICAL FIX: Test if PortfolioPnLService is properly injected
      if (!this.portfolioPnLService) {
        console.error('❌ PortfolioPnLService is not injected!');
        throw new Error('PortfolioPnLService is not available');
      }
      console.log('✅ PortfolioPnLService is properly injected');

      // CRITICAL FIX: Use PortfolioPnLService for consistent calculations
      // This ensures dashboard and socket updates use the same calculation method

      // CRITICAL FIX: Use average buy prices for consistent calculations
      // This ensures dashboard and socket updates use the same calculation method
      const portfolioPositions = await this.portfolioService.getByUser(userId);
      console.log(`🔍 Portfolio positions found: ${portfolioPositions.length}`);

      const currentPrices: Record<string, number> = {};

      for (const position of portfolioPositions) {
        // Use average buy price for consistent calculations with socket updates
        // This prevents discrepancies between real-time updates and dashboard data
        currentPrices[position.ticker] = position.averagePrice;
        console.log(
          `🔍 Setting price for ${position.ticker}: $${position.averagePrice}`,
        );
      }

      console.log(`🔍 Calling PortfolioPnLService.calculatePortfolioPnL...`);
      // Use PortfolioPnLService for consistent calculations
      const pnlData = await this.portfolioPnLService.calculatePortfolioPnL(
        userId,
        currentPrices,
      );
      console.log(`🔍 PortfolioPnLService returned:`, pnlData);

      // Convert positions to StockPosition entities
      const stockPositions: StockPosition[] = [];
      for (const position of pnlData.positions) {
        // Get stock info
        const stock = await this.stockService.getStock(position.ticker);

        const stockPosition = new StockPosition();
        stockPosition.ticker = position.ticker;
        stockPosition.companyName = stock?.companyName || position.ticker;
        stockPosition.avatar =
          stock?.avatar ||
          `https://financialmodelingprep.com/image-stock/${position.ticker}.png`;
        stockPosition.quantity = position.quantity;
        stockPosition.averageBuyPrice = position.averagePrice;
        stockPosition.currentPrice = position.currentPrice;
        stockPosition.marketValue = position.marketValue;
        stockPosition.unrealizedPnL = position.unrealizedPnL;
        stockPosition.unrealizedPnLPercent = position.pnlPercentage;

        stockPositions.push(stockPosition);
      }

      // CRITICAL FIX: Use pnlData values for consistent calculations
      const dashboardResult = new DashboardResult();
      dashboardResult.totalPortfolioValue = pnlData.totalAssets; // Total assets (stocks + cash)
      dashboardResult.stocksOnlyValue = pnlData.totalPortfolioValue; // Stocks only (excluding cash)
      dashboardResult.totalRealizedPnL = pnlData.totalRealizedPnL;
      dashboardResult.totalUnrealizedPnL = pnlData.totalUnrealizedPnL;
      dashboardResult.totalPnL = pnlData.totalPnL;
      dashboardResult.cashBalance = pnlData.balance;
      dashboardResult.stockPositions = stockPositions;

      // DEBUG: Log calculation details
      console.log(`🔍 Dashboard Calculation Debug for user ${userId}:`);
      console.log(`  - Portfolio positions: ${portfolioPositions.length}`);
      console.log(
        `  - Total portfolio value (stocks only): $${pnlData.totalPortfolioValue.toFixed(2)}`,
      );
      console.log(`  - Cash balance: $${pnlData.balance.toFixed(2)}`);
      console.log(
        `  - Total assets (stocks + cash): $${pnlData.totalAssets.toFixed(2)}`,
      );
      console.log(
        `  - Total realized P&L: $${pnlData.totalRealizedPnL.toFixed(2)}`,
      );
      console.log(
        `  - Total unrealized P&L: $${pnlData.totalUnrealizedPnL.toFixed(2)}`,
      );
      console.log(`  - Total P&L: $${pnlData.totalPnL.toFixed(2)}`);
      console.log(
        `  - Final totalPortfolioValue (for frontend): $${dashboardResult.totalPortfolioValue.toFixed(2)}`,
      );

      return dashboardResult;
    } catch (error) {
      console.error(`❌ Error in DashboardService.getDashboard:`, error);
      throw error;
    }
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
