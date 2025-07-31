import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OrderService } from './order.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderType, OrderStatus } from '@prisma/client';

@Injectable()
export class PriceFeedListenerService {
  private logger = new Logger('PriceFeedListenerService');

  constructor(
    private prisma: PrismaService,
    private orderService: OrderService,
    private eventEmitter: EventEmitter2,
  ) {}

  async handlePriceUpdate(ticker: string, currentPrice: number) {
    this.logger.log(`Price update for ${ticker}: $${currentPrice}`);

    // Check for STOP orders that should be triggered
    await this.checkStopOrders(ticker, currentPrice);
  }

  private async checkStopOrders(ticker: string, currentPrice: number) {
    // Find all STOP orders for this ticker that are still open
    const stopOrders = await this.prisma.order.findMany({
      where: {
        ticker,
        type: {
          in: [OrderType.STOP_LIMIT, OrderType.STOP_MARKET],
        },
        status: OrderStatus.OPEN,
        triggerPrice: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'asc', // FIFO order
      },
    });

    for (const order of stopOrders) {
      if (!order.triggerPrice) continue;

      const shouldTrigger = this.shouldTriggerStopOrder(order, currentPrice);

      if (shouldTrigger) {
        await this.triggerStopOrder(order, currentPrice);
      }
    }
  }

  private shouldTriggerStopOrder(order: any, currentPrice: number): boolean {
    if (!order.triggerPrice) return false;

    // For BUY STOP orders: trigger when price rises above trigger
    if (order.side === 'BUY') {
      return currentPrice >= order.triggerPrice;
    }

    // For SELL STOP orders: trigger when price falls below trigger
    if (order.side === 'SELL') {
      return currentPrice <= order.triggerPrice;
    }

    return false;
  }

  private async triggerStopOrder(order: any, currentPrice: number) {
    this.logger.log(
      `Triggering STOP order ${order.id} at price $${currentPrice}`,
    );

    try {
      // Convert STOP order to regular LIMIT/MARKET order
      const newOrderType =
        order.type === OrderType.STOP_LIMIT ? 'LIMIT' : 'MARKET';

      // Create new order with the triggered price
      const triggeredOrder = await this.prisma.order.create({
        data: {
          userId: order.userId,
          ticker: order.ticker,
          side: order.side,
          price:
            order.type === OrderType.STOP_LIMIT ? order.price : currentPrice,
          quantity: order.quantity,
          type: newOrderType,
          timeInForce: order.timeInForce,
          status: 'OPEN',
        },
      });

      // Cancel the original STOP order
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });

      this.logger.log(
        `STOP order ${order.id} converted to ${newOrderType} order ${triggeredOrder.id}`,
      );

      // Try to match the new order immediately (only if orderService is available)
      if (this.orderService) {
        await this.orderService.tryMatchByOrder(triggeredOrder);
      }

      // Emit event for notifications (only if eventEmitter is available)
      if (this.eventEmitter) {
        this.eventEmitter.emit('stop.order.triggered', {
          originalOrderId: order.id,
          newOrderId: triggeredOrder.id,
          ticker: order.ticker,
          price: currentPrice,
          userId: order.userId,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to trigger STOP order ${order.id}:`, error);
    }
  }

  // Method to manually check all STOP orders (for testing)
  async checkAllStopOrders() {
    const allStopOrders = await this.prisma.order.findMany({
      where: {
        type: {
          in: [OrderType.STOP_LIMIT, OrderType.STOP_MARKET],
        },
        status: OrderStatus.OPEN,
        triggerPrice: {
          not: null,
        },
      },
      include: {
        stock: true,
      },
    });

    for (const order of allStopOrders) {
      // Get current price for this ticker
      const latestMarketData = await this.prisma.marketData.findFirst({
        where: { ticker: order.ticker },
        orderBy: { timestamp: 'desc' },
      });

      if (latestMarketData) {
        await this.checkStopOrders(order.ticker, latestMarketData.close);
      }
    }
  }
}
