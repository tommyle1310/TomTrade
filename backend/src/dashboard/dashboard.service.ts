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
  // CRITICAL FIX: Static cache to store latest prices from socket updates
  public static latestPricesCache: Record<
    string,
    { price: number; timestamp: number }
  > = {};

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

  // CRITICAL FIX: Method to update latest prices from socket updates
  static updateLatestPrice(ticker: string, price: number) {
    DashboardService.latestPricesCache[ticker] = {
      price,
      timestamp: Date.now(),
    };
    console.log(`📊 Updated latest price for ${ticker}: $${price}`);

    // CRITICAL FIX: Force immediate cache update to ensure consistency
    setTimeout(() => {
      DashboardService.latestPricesCache[ticker] = {
        price,
        timestamp: Date.now(),
      };
      console.log(`📊 Re-confirmed price cache for ${ticker}: $${price}`);
    }, 100);
  }

  // CRITICAL FIX: Method to clear price cache (for debugging)
  static clearPriceCache() {
    DashboardService.latestPricesCache = {};
    console.log(`📊 Cleared price cache`);
  }

  // CRITICAL FIX: Method to force refresh prices from database
  public static async forceRefreshPrices(prisma: PrismaService) {
    console.log('🔄 Force refreshing prices from database...');

    // Get all unique tickers from market data
    const marketData = await prisma.marketData.findMany({
      select: { ticker: true },
      distinct: ['ticker'],
    });

    for (const data of marketData) {
      const latestPrice = await prisma.marketData.findFirst({
        where: { ticker: data.ticker },
        orderBy: { timestamp: 'desc' },
        select: { close: true },
      });

      if (latestPrice?.close) {
        DashboardService.latestPricesCache[data.ticker] = {
          price: latestPrice.close,
          timestamp: Date.now(),
        };
        console.log(
          `📊 Refreshed price for ${data.ticker}: $${latestPrice.close}`,
        );
      }
    }

    console.log('✅ Price refresh completed');
  }

  // CRITICAL FIX: Method to get latest price from cache or database
  private async getLatestPrice(ticker: string): Promise<number> {
    const cached = DashboardService.latestPricesCache[ticker];
    const now = Date.now();

    // CRITICAL FIX: Extend cache timeout to 5 minutes to prevent stale data
    if (cached && now - cached.timestamp < 300000) {
      // 5 minutes instead of 30 seconds
      console.log(
        `📊 Using cached price for ${ticker}: $${cached.price} (age: ${Math.round((now - cached.timestamp) / 1000)}s)`,
      );
      return cached.price;
    }

    // Fallback to database
    const latestMarketData = await this.prisma.marketData.findFirst({
      where: { ticker },
      orderBy: { timestamp: 'desc' },
    });

    const price = latestMarketData?.close || 0;
    console.log(
      `📊 Using database price for ${ticker}: $${price} (timestamp: ${latestMarketData?.timestamp})`,
    );

    // CRITICAL FIX: Update cache with database price to keep them in sync
    if (price > 0) {
      DashboardService.latestPricesCache[ticker] = {
        price,
        timestamp: now,
      };
      console.log(
        `📊 Synced cache with database price for ${ticker}: $${price}`,
      );
    }

    return price;
  }

  // CRITICAL FIX: Method to get portfolio positions with consistent pricing
  private async getPortfolioPositionsWithPrices(userId: string): Promise<{
    positions: any[];
    currentPrices: Record<string, number>;
  }> {
    // CRITICAL FIX: Force refresh portfolio data from database to ensure accuracy
    const portfolioPositions = await this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { ticker: 'asc' }, // CRITICAL FIX: Consistent ordering
    });
    console.log(`🔍 Portfolio positions found: ${portfolioPositions.length}`);

    // CRITICAL FIX: Log each position for debugging
    portfolioPositions.forEach((pos, index) => {
      console.log(
        `  ${index + 1}. ${pos.ticker}: ${pos.quantity} shares @ avg $${pos.averagePrice}`,
      );
    });

    const currentPrices: Record<string, number> = {};

    for (const position of portfolioPositions) {
      // CRITICAL FIX: Get the most up-to-date price for each ticker
      const currentPrice = await this.getLatestPrice(position.ticker);

      if (!currentPrice || currentPrice === 0) {
        console.log(
          `⚠️ No market data for ${position.ticker}, using average price as fallback`,
        );
        currentPrices[position.ticker] = position.averagePrice;
      } else {
        console.log(
          `✅ Found market data for ${position.ticker}: $${currentPrice}`,
        );
        currentPrices[position.ticker] = currentPrice;
      }

      console.log(
        `🔍 Setting price for ${position.ticker}: $${currentPrices[position.ticker]} (avg: ${position.averagePrice})`,
      );
    }

    return { positions: portfolioPositions, currentPrices };
  }

  async getDashboard(userId: string): Promise<DashboardResult> {
    console.log(`🔍 DashboardService.getDashboard called for user: ${userId}`);

    try {
      // CRITICAL FIX: Force refresh prices from database to ensure consistency
      await DashboardService.forceRefreshPrices(this.prisma);

      // CRITICAL FIX: Test if PortfolioPnLService is properly injected
      if (!this.portfolioPnLService) {
        console.error('❌ PortfolioPnLService is not injected!');
        throw new Error('PortfolioPnLService is not available');
      }
      console.log('✅ PortfolioPnLService is properly injected');

      // CRITICAL FIX: Force refresh portfolio data from database to ensure accuracy
      console.log('🔄 Force refreshing portfolio data from database...');
      const portfolioPositions = await this.prisma.portfolio.findMany({
        where: { userId },
        orderBy: { ticker: 'asc' },
      });
      console.log(
        `🔍 Found ${portfolioPositions.length} portfolio positions for ${userId}`,
      );

      // CRITICAL FIX: Get portfolio positions with consistent pricing
      const { positions: portfolioPositionsWithPrices, currentPrices } =
        await this.getPortfolioPositionsWithPrices(userId);

      console.log(
        `🔍 Calling PortfolioPnLService.calculatePortfolioPnL with prices:`,
        currentPrices,
      );

      // CRITICAL FIX: Use PortfolioPnLService with the SAME prices as socket updates
      const pnlData = await this.portfolioPnLService.calculatePortfolioPnL(
        userId,
        currentPrices,
      );
      console.log(`🔍 PortfolioPnLService returned:`, pnlData);

      // CRITICAL FIX: Debug price cache state
      console.log(`🔍 Price cache state:`, DashboardService.latestPricesCache);

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

      // CRITICAL FIX: Ensure we're using the correct values
      const dashboardResult = new DashboardResult();
      dashboardResult.totalPortfolioValue = pnlData.totalAssets; // Total assets (stocks + cash)
      dashboardResult.stocksOnlyValue = pnlData.totalPortfolioValue; // Stocks only (excluding cash)
      dashboardResult.totalRealizedPnL = pnlData.totalRealizedPnL;
      dashboardResult.totalUnrealizedPnL = pnlData.totalUnrealizedPnL;
      dashboardResult.totalPnL = pnlData.totalPnL;
      dashboardResult.cashBalance = pnlData.balance;
      dashboardResult.stockPositions = stockPositions;

      // DEBUG: Log calculation details

      return dashboardResult;
    } catch (error) {
      console.error(`❌ Error in DashboardService.getDashboard:`, error);
      throw error;
    }
  }

  // CRITICAL FIX: This method was removed because it was causing inconsistencies
  // Now we use the price cache directly which is updated by the order service

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
