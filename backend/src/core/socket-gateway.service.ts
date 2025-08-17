import { Injectable, Inject } from '@nestjs/common';
import { Server } from 'socket.io';
import { PortfolioPnLService } from '../portfolio/portfolio-pnl.service';
import { BalanceService } from '../balance/balance.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SocketService {
  constructor(
    @Inject(PortfolioPnLService)
    private portfolioPnLService: PortfolioPnLService,
    @Inject(BalanceService) private balanceService: BalanceService,
    @Inject(PrismaService) private prismaService: PrismaService,
  ) {
    console.log('🔍 SocketService constructor called');
    console.log('🔍 PortfolioPnLService injected:', !!this.portfolioPnLService);
    console.log('🔍 BalanceService injected:', !!this.balanceService);
    console.log('🔍 PrismaService injected:', !!this.prismaService);
  }

  private _server: Server;
  private sentIds = new Set<string>();

  get server(): Server | undefined {
    return this._server;
  }

  setServer(server: Server) {
    console.log(
      '🔧 SocketService.setServer called with server:',
      server ? 'valid server instance' : 'null/undefined',
    );
    console.log(`🔍 Server rooms:`, server?.sockets?.adapter?.rooms);

    if (!this._server) {
      this._server = server;
      console.log('✅ SocketService._server set successfully');
    } else {
      console.log('⚠️ SocketService._server already set, skipping');
    }
  }

  // Helper method to send to userId room (which clients are actually joining)
  private sendToUser(userId: string, event: string, data: any) {
    console.log(`🔍 sendToUser called - event: ${event}, userId: ${userId}`);
    console.log(`🔍 Data to send:`, data);

    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    // Try to send directly without accessing sockets.adapter.rooms
    try {
      // Send to userId room (which clients are actually joining)
      console.log(`🔍 Sending ${event} to room: ${userId}`);
      this._server.to(userId).emit(event, data);
      console.log(`✅ ${event} sent to user ${userId}`);
    } catch (error) {
      console.error(
        `❌ Error sending ${event} to user ${userId}:`,
        error.message,
      );
    }
  }

  // Helper method to send to both userId and userEmail rooms for maximum compatibility
  private sendToUserWithEmail(
    userId: string,
    userEmail: string,
    event: string,
    data: any,
  ) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    // Send to both userId and userEmail rooms for maximum compatibility
    try {
      this._server.to(userId).emit(event, data);
      this._server.to(userEmail).emit(event, data);
      console.log(`✅ ${event} sent to user ${userEmail} (${userId})`);
    } catch (error) {
      console.error(
        `❌ Error sending ${event} to user ${userEmail} (${userId}):`,
        error.message,
      );
    }
  }

  sendAlert(alert: {
    userId: string;
    data: {
      message: string;
      alert: any;
      currentPrice?: number;
    };
  }) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `🚨 Attempting to send price alert to user ${alert.userId}:`,
      alert.data,
    );

    // Add createdAt timestamp to the alert data
    const alertDataWithTimestamp = {
      ...alert.data,
      createdAt: new Date().toISOString(),
    };

    this.sendToUser(alert.userId, 'priceAlert', alertDataWithTimestamp);

    console.log(`✅ Price alert sent to user ${alert.userId}`);
  }

  sendOrderNotification(
    userId: string,
    notification: {
      type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED';
      orderId: string;
      ticker: string;
      side: 'BUY' | 'SELL';
      quantity: number;
      price: number;
      message: string;
    },
  ) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `🔔 Attempting to send order notification to user ${userId}:`,
      notification,
    );

    // Add createdAt timestamp to the notification
    const notificationWithTimestamp = {
      ...notification,
      createdAt: new Date().toISOString(),
    };

    this.sendToUser(userId, 'orderNotification', notificationWithTimestamp);

    console.log(
      `✅ Order notification sent to user ${userId}: ${notification.type}`,
    );
  }

  sendPortfolioUpdate(
    userId: string,
    portfolioData: {
      totalValue: number;
      totalPnL: number;
      positions: Array<{
        ticker: string;
        quantity: number;
        averagePrice: number;
        currentPrice: number;
        marketValue: number;
        unrealizedPnL: number;
        pnlPercentage: number;
      }>;
    },
  ) {
    console.log(`🔍 sendPortfolioUpdate called for user: ${userId}`);
    console.log(`🔍 Portfolio data:`, portfolioData);

    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `📊 Attempting to send portfolio update to user ${userId}:`,
      portfolioData,
    );

    // Add createdAt timestamp to the portfolio data
    const portfolioDataWithTimestamp = {
      ...portfolioData,
      createdAt: new Date().toISOString(),
    };

    this.sendToUser(userId, 'portfolioUpdate', portfolioDataWithTimestamp);

    console.log(`✅ Portfolio update sent to user ${userId}`);
  }

  // CRITICAL FIX: Add method to request portfolio update with current market prices
  async requestPortfolioUpdateWithCurrentPrices(userId: string) {
    console.log(
      `🔍 requestPortfolioUpdateWithCurrentPrices called for user: ${userId}`,
    );
    console.log(
      '🔍 CRITICAL: This function MUST return FRESH portfolio data, not stale data',
    );

    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `📊 CRITICAL: Requesting FRESH portfolio update with current prices for user ${userId}`,
    );
    console.log(
      '🔍 This will query the database for the LATEST portfolio and market data',
    );

    try {
      console.log('🔍 Starting portfolio calculation...');

      // CRITICAL FIX: Actually calculate and send current portfolio data using injected services

      // Get current market prices for all tickers in user's portfolio
      console.log('🔍 Querying user portfolio from database...');
      const userPortfolio = await this.prismaService.portfolio.findMany({
        where: { userId },
        select: { ticker: true },
      });
      console.log('🔍 User portfolio found:', userPortfolio);

      const currentPrices: Record<string, number> = {};

      // CRITICAL FIX: Force refresh market data to get LATEST prices, not cached ones
      console.log(
        '🔍 CRITICAL: Force refreshing market data to get LATEST prices...',
      );

      // Get current market prices for each ticker
      console.log('🔍 Querying current market prices...');
      for (const position of userPortfolio) {
        console.log(`🔍 Querying market data for ${position.ticker}...`);

        // CRITICAL FIX: Force refresh by getting the MOST RECENT market data
        const latestMarketData = await this.prismaService.marketData.findFirst({
          where: { ticker: position.ticker },
          orderBy: { timestamp: 'desc' },
          select: { close: true, timestamp: true },
        });

        if (latestMarketData?.close) {
          currentPrices[position.ticker] = latestMarketData.close;
          console.log(
            `🔍 ${position.ticker} LATEST price: $${currentPrices[position.ticker]} (timestamp: ${latestMarketData.timestamp})`,
          );
        } else {
          console.log(`⚠️ No market data found for ${position.ticker}`);
          currentPrices[position.ticker] = 0;
        }
      }

      console.log(`📊 Current market prices for ${userId}:`, currentPrices);

      // CRITICAL FIX: Verify we have valid prices before calculating
      const validPrices = Object.values(currentPrices).filter(
        (price) => price > 0,
      );
      if (validPrices.length === 0) {
        console.error(
          '❌ No valid market prices found, cannot calculate portfolio',
        );
        return;
      }
      console.log(`✅ Found ${validPrices.length} valid market prices`);

      // Calculate portfolio with current market prices
      console.log('🔍 Calling PortfolioPnLService.calculatePortfolioPnL...');
      console.log('🔍 CRITICAL: Using LATEST market prices, not cached ones');

      const portfolioData =
        await this.portfolioPnLService.calculatePortfolioPnL(
          userId,
          currentPrices,
        );
      console.log('🔍 Portfolio calculation result:', portfolioData);

      console.log('🔍 Calling BalanceService.getBalance...');
      console.log('🔍 CRITICAL: Getting FRESH balance, not cached one');
      const balance = await this.balanceService.getBalance(userId);
      console.log('🔍 Balance result:', balance);

      console.log(
        `📊 Calculated portfolio for ${userId}: totalAssets=${portfolioData.totalAssets}, balance=${balance}`,
      );

      // CRITICAL FIX: Send the ACTUAL FRESH portfolio data via socket
      console.log('🔍 CRITICAL: Sending FRESH portfolio update via socket...');
      console.log('🔍 Portfolio data being sent:', {
        totalValue: portfolioData.totalAssets,
        totalPnL: portfolioData.totalPnL,
        positionsCount: portfolioData.positions.length,
        marketPrices: currentPrices,
      });

      await this.sendPortfolioUpdate(userId, {
        totalValue: portfolioData.totalAssets,
        totalPnL: portfolioData.totalPnL,
        positions: portfolioData.positions,
      });
      console.log('🔍 FRESH Portfolio update sent');

      // CRITICAL FIX: Send the ACTUAL FRESH balance data via socket
      console.log('🔍 CRITICAL: Sending FRESH balance update via socket...');
      console.log('🔍 Balance data being sent:', {
        balance,
        totalAssets: portfolioData.totalAssets,
      });

      await this.sendBalanceUpdate(userId, {
        balance,
        totalAssets: portfolioData.totalAssets,
      });
      console.log('🔍 FRESH Balance update sent');

      console.log(
        `✅ CRITICAL: FRESH Portfolio update with current prices sent to user ${userId}`,
      );

      // CRITICAL FIX: Return the result so the gateway knows it succeeded
      return {
        success: true,
        userId,
        portfolioValue: portfolioData.totalAssets,
        balance,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `❌ CRITICAL: Failed to calculate FRESH portfolio for user ${userId}:`,
        error,
      );
      console.error(`🔍 Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // CRITICAL FIX: Return error result so the gateway knows it failed
      return {
        success: false,
        userId,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  sendBalanceUpdate(
    userId: string,
    balanceData: {
      balance: number;
      totalAssets: number;
    },
  ) {
    console.log(`🔍 sendBalanceUpdate called for user: ${userId}`);
    console.log(`🔍 Balance data:`, balanceData);

    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `💰 Attempting to send balance update to user ${userId}:`,
      balanceData,
    );

    // Add createdAt timestamp to the balance data
    const balanceDataWithTimestamp = {
      ...balanceData,
      createdAt: new Date().toISOString(),
    };

    this.sendToUser(userId, 'balanceUpdate', balanceDataWithTimestamp);

    console.log(`✅ Balance update sent to user ${userId}`);
  }

  broadcastMarketDataUpdate(marketData: {
    ticker: string;
    price: number;
    volume: number;
    timestamp: string;
  }) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `📊 Broadcasting market data update: ${marketData.ticker} at $${marketData.price}`,
    );

    // Add createdAt timestamp to the market data
    const marketDataWithTimestamp = {
      ...marketData,
      createdAt: new Date().toISOString(),
    };

    this._server.emit('marketDataUpdate', marketDataWithTimestamp);
    console.log(`✅ Market data update broadcasted to all clients`);
  }
}
