import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PlaceOrderInput } from './dto/place-order.input';
import { TransactionService } from 'src/transaction/transaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  private logger = new Logger('OrderService');

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TransactionService))
    private txService: TransactionService,
    private eventEmitter: EventEmitter2,
  ) {}

  async placeOrder(userId: string, input: PlaceOrderInput): Promise<Order> {
    return this.prisma.order.create({
      data: { ...input, userId },
    });
  }

  /** Gọi khi có giá mới */
  async tryMatch(ticker: string, marketPrice: number) {
    const candidates = await this.prisma.order.findMany({
      where: {
        ticker,
        status: OrderStatus.OPEN,
        OR: [
          { side: 'BUY', price: { gte: marketPrice } },
          { side: 'SELL', price: { lte: marketPrice } },
        ],
      },
    });
  
    this.logger.log(`🧐 Found ${candidates.length} candidates to match`);
  
    for (const order of candidates) {
      await this.matchOrder(order, marketPrice);
    }
  }
  

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  

  private async matchOrder(order: Order, executedPrice: number) {
    await this.prisma.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.FILLED,
          matchedAt: new Date(),
          price: executedPrice,
        },
      });

      // 2. Record transaction & update portfolio
      await this.txService.executeMatchedOrder(order, executedPrice, tx);
    });

    this.logger.log(
      `✔️ Matched order ${order.id} for ${order.ticker} @${executedPrice}`,
    );

    // 3. Emit event → Frontend có thể subscribe
    this.eventEmitter.emit('order.matched', { orderId: order.id });
  }
}
