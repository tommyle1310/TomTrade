import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderService } from '../order/order.service';
import { PortfolioPnLService } from '../portfolio/portfolio-pnl.service';
import { BalanceService } from '../balance/balance.service';
import { SocketService } from '../core/socket-gateway.service';
import { OrderSide } from '../order/enums/order-side.enum';
import { OrderType } from '../order/enums/order-type.enum';
import { TimeInForce } from '../order/enums/time-in-force.enum';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);
  private isSimulationActive = false;
  private simulationInterval: NodeJS.Timeout | null = null;
  private simulationUsers: string[] = [];
  private simulationStocks: string[] = [];

  constructor(
    private prisma: PrismaService,
    private orderService: OrderService,
    private portfolioPnLService: PortfolioPnLService,
    private balanceService: BalanceService,
    private socketService: SocketService,
  ) {
    this.logger.log('🔧 SimulationService initialized');
  }

  async startSimulation() {
    if (this.isSimulationActive) {
      this.logger.log('⚠️ Simulation is already running');
      return { success: false, message: 'Simulation is already running' };
    }

    try {
      this.logger.log('🚀 Starting trading simulation...');

      // Get available users and stocks from seed data
      await this.initializeSimulationData();

      this.isSimulationActive = true;

      // Start simulation loop
      this.simulationInterval = setInterval(() => {
        this.runSimulationCycle();
      }, 10000); // Run every 10 seconds

      this.logger.log('✅ Trading simulation started successfully');
      return {
        success: true,
        message: 'Trading simulation started',
        users: this.simulationUsers,
        stocks: this.simulationStocks,
      };
    } catch (error) {
      this.logger.error('❌ Failed to start simulation:', error);
      return { success: false, message: error.message };
    }
  }

  async stopSimulation() {
    if (!this.isSimulationActive) {
      this.logger.log('⚠️ Simulation is not running');
      return { success: false, message: 'Simulation is not running' };
    }

    try {
      this.logger.log('🛑 Stopping trading simulation...');

      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
      }

      this.isSimulationActive = false;
      this.logger.log('✅ Trading simulation stopped successfully');

      return { success: true, message: 'Trading simulation stopped' };
    } catch (error) {
      this.logger.error('❌ Failed to stop simulation:', error);
      return { success: false, message: error.message };
    }
  }

  getSimulationStatus() {
    return {
      isActive: this.isSimulationActive,
      users: this.simulationUsers,
      stocks: this.simulationStocks,
      lastUpdate: new Date().toISOString(),
    };
  }

  private async initializeSimulationData() {
    this.logger.log('🔍 Initializing simulation data...');

    // Get users from seed data (excluding admin)
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { id: true, email: true },
    });

    this.simulationUsers = users.map((u) => u.id);
    this.logger.log(
      `📊 Found ${this.simulationUsers.length} users for simulation`,
    );

    // Get stocks from seed data
    const stocks = await this.prisma.stock.findMany({
      select: { ticker: true },
    });

    this.simulationStocks = stocks.map((s) => s.ticker);
    this.logger.log(
      `📈 Found ${this.simulationStocks.length} stocks for simulation`,
    );
  }

  private async runSimulationCycle() {
    if (!this.isSimulationActive) return;

    try {
      this.logger.log('🔄 Running simulation cycle...');

      // 1. Update market data with realistic price movements
      await this.updateMarketData();

      // 2. Create some order interactions
      await this.createOrderInteractions();

      // 3. Send real-time updates to connected clients
      await this.sendRealTimeUpdates();

      this.logger.log('✅ Simulation cycle completed');
    } catch (error) {
      this.logger.error('❌ Simulation cycle failed:', error);
    }
  }

  private async updateMarketData() {
    this.logger.log('📊 Updating market data...');

    for (const ticker of this.simulationStocks) {
      try {
        // Get current market data
        const currentData = await this.prisma.marketData.findFirst({
          where: { ticker },
          orderBy: { timestamp: 'desc' },
        });

        if (!currentData) continue;

        // Create realistic price movement (±2% with some randomness)
        const priceChange = (Math.random() - 0.5) * 0.04; // ±2%
        const newPrice = currentData.close * (1 + priceChange);

        // Add some volume variation
        const volumeChange = (Math.random() - 0.5) * 0.2; // ±10%
        const newVolume = Math.max(
          100000,
          Number(currentData.volume) * (1 + volumeChange),
        );

        // Create new market data entry
        const newMarketData = await this.prisma.marketData.create({
          data: {
            ticker,
            open: currentData.close,
            high: Math.max(currentData.close, newPrice),
            low: Math.min(currentData.close, newPrice),
            close: newPrice,
            volume: BigInt(Math.floor(newVolume)),
            interval: '1D',
            timestamp: new Date(),
          },
        });

        this.logger.log(
          `📈 ${ticker}: $${currentData.close.toFixed(2)} → $${newPrice.toFixed(2)}`,
        );

        // Broadcast market data update
        this.socketService.broadcastMarketDataUpdate({
          ticker,
          price: newPrice,
          volume: Math.floor(newVolume),
          timestamp: newMarketData.timestamp.toISOString(),
        });
      } catch (error) {
        this.logger.error(
          `❌ Failed to update market data for ${ticker}:`,
          error,
        );
      }
    }
  }

  private async createOrderInteractions() {
    this.logger.log('🔄 Creating order interactions...');

    // Select random users for trading
    const activeUsers = this.simulationUsers.filter(() => Math.random() > 0.7);

    for (const userId of activeUsers) {
      try {
        await this.createUserTrade(userId);
      } catch (error) {
        this.logger.error(
          `❌ Failed to create trade for user ${userId}:`,
          error,
        );
      }
    }
  }

  private async createUserTrade(userId: string) {
    try {
      // Get user's current portfolio and balance
      const userBalance = await this.balanceService.getBalance(userId);
      const userPortfolio = await this.prisma.portfolio.findMany({
        where: { userId },
      });

      if (!userBalance || userBalance <= 0) return;

      // Select random stock
      const randomStock =
        this.simulationStocks[
          Math.floor(Math.random() * this.simulationStocks.length)
        ];

      // Get current market price
      const marketData = await this.prisma.marketData.findFirst({
        where: { ticker: randomStock },
        orderBy: { timestamp: 'desc' },
      });

      if (!marketData) return;

      const currentPrice = marketData.close;
      const maxQuantity = Math.floor(userBalance / currentPrice);

      if (maxQuantity < 1) return;

      // Randomly decide to buy or sell
      const isBuy = Math.random() > 0.5;
      const quantity =
        Math.floor(Math.random() * Math.min(maxQuantity, 10)) + 1;

      if (isBuy) {
        // Check if user has enough cash
        if (userBalance >= quantity * currentPrice) {
          await this.createBuyOrder(
            userId,
            randomStock,
            quantity,
            currentPrice,
          );
        }
      } else {
        // Check if user has enough shares to sell
        const userPosition = userPortfolio.find(
          (p) => p.ticker === randomStock,
        );
        if (userPosition && userPosition.quantity >= quantity) {
          await this.createSellOrder(
            userId,
            randomStock,
            quantity,
            currentPrice,
          );
        }
      }
    } catch (error) {
      this.logger.error(`❌ Failed to create user trade:`, error);
    }
  }

  private async createBuyOrder(
    userId: string,
    ticker: string,
    quantity: number,
    price: number,
  ) {
    try {
      this.logger.log(
        `📈 Creating BUY order: ${userId} buys ${quantity} ${ticker} @ $${price}`,
      );

      const order = await this.orderService.placeOrder(userId, {
        ticker,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        quantity,
        price: price, // Use actual price for simulation
        timeInForce: TimeInForce.GTC,
      });

      // Try to match the order immediately
      await this.orderService.tryMatchByOrder(order);

      this.logger.log(`✅ BUY order created and processed: ${order.id}`);
    } catch (error) {
      this.logger.error(`❌ Failed to create BUY order:`, error);
    }
  }

  private async createSellOrder(
    userId: string,
    ticker: string,
    quantity: number,
    price: number,
  ) {
    try {
      this.logger.log(
        `📉 Creating SELL order: ${userId} sells ${quantity} ${ticker} @ $${price}`,
      );

      const order = await this.orderService.placeOrder(userId, {
        ticker,
        side: OrderSide.SELL,
        type: OrderType.MARKET,
        quantity,
        price: price, // Use actual price for simulation
        timeInForce: TimeInForce.GTC,
      });

      // Try to match the order immediately
      await this.orderService.tryMatchByOrder(order);

      this.logger.log(`✅ SELL order created and processed: ${order.id}`);
    } catch (error) {
      this.logger.error(`❌ Failed to create SELL order:`, error);
    }
  }

  private async sendRealTimeUpdates() {
    this.logger.log('📡 Sending real-time updates...');

    for (const userId of this.simulationUsers) {
      try {
        // Send portfolio update
        await this.socketService.requestPortfolioUpdateWithCurrentPrices(
          userId,
        );

        // Send balance update
        const balance = await this.balanceService.getBalance(userId);
        if (balance !== undefined) {
          this.socketService.sendBalanceUpdate(userId, {
            balance,
            totalAssets: balance, // Will be updated by portfolio update
          });
        }
      } catch (error) {
        this.logger.error(
          `❌ Failed to send real-time updates for user ${userId}:`,
          error,
        );
      }
    }
  }

  // Manual trigger methods for testing
  async triggerPriceAlert(userId: string, ticker: string) {
    try {
      const marketData = await this.prisma.marketData.findFirst({
        where: { ticker },
        orderBy: { timestamp: 'desc' },
      });

      if (marketData) {
        this.socketService.sendAlert({
          userId,
          data: {
            message: `Price alert for ${ticker}`,
            alert: { id: 'simulation-alert', ticker },
            currentPrice: marketData.close,
          },
        });
        this.logger.log(`🚨 Price alert sent to user ${userId} for ${ticker}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to trigger price alert:`, error);
    }
  }

  async triggerOrderNotification(
    userId: string,
    type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED',
  ) {
    try {
      this.socketService.sendOrderNotification(userId, {
        type,
        orderId: `sim-${Date.now()}`,
        ticker: 'AAPL',
        side: 'BUY',
        quantity: 10,
        price: 150,
        message: `Simulation ${type.toLowerCase()} notification`,
      });
      this.logger.log(`🔔 ${type} notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to trigger order notification:`, error);
    }
  }
}
