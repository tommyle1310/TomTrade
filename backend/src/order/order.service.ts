import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PlaceOrderInput } from './dto/place-order.input';
import { TransactionService } from 'src/transaction/transaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus, OrderType, OrderSide } from '@prisma/client';

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
    const order = await this.prisma.order.create({
      data: { ...input, userId },
    });

    if (order.type === OrderType.MARKET) {
      await this.tryMatchByOrder(order);

      const updatedOrder = await this.prisma.order.findUnique({ where: { id: order.id } });
      if (!updatedOrder) throw new Error('Order not found');
      return updatedOrder;
    }

    return order;
  }

  /** Gọi từ: MarketData update hoặc placeOrder(MARKET) */
  async tryMatchByOrder(order: Order) {
    const oppositeSide: OrderSide = order.side === 'BUY' ? 'SELL' : 'BUY';
    const priceComparator = order.side === 'BUY' ? 'lte' : 'gte';
    const priceOrder = order.side === 'BUY' ? 'asc' : 'desc';
  
    const candidates = await this.prisma.order.findMany({
      where: {
        ticker: order.ticker,
        status: OrderStatus.OPEN,
        side: oppositeSide,
        type: OrderType.LIMIT,
        price: {
          [priceComparator]: order.price,
        },
      },
      orderBy: {
        price: priceOrder,
      },
    });
  
    this.logger.log(
      `🔁 Matching MARKET order ${order.id} → found ${candidates.length} LIMITs`,
    );
  
    if (candidates.length === 0) return;
  
    const matchedOrder = candidates[0];

    // 💡 Ai BUY thì nhận cổ, ai SELL thì bị trừ cổ
    await this.matchOrder(matchedOrder, matchedOrder.price, order); // SELL lệnh LIMIT
    await this.matchOrder(order, matchedOrder.price, matchedOrder); // BUY lệnh MARKET
  }
  
  async tryMatchByPrice(ticker: string, currentPrice: number) {
    const candidates = await this.prisma.order.findMany({
      where: {
        ticker,
        status: OrderStatus.OPEN,
        type: OrderType.MARKET,
      },
    });
  
    this.logger.log(
      `📈 tryMatchByPrice @${currentPrice} for ${ticker} → ${candidates.length} MARKETs`,
    );
  
    for (const order of candidates) {
      await this.tryMatchByOrder({ ...order, price: currentPrice });
    }
  }
  

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async matchOrder(
    order: Order,
    executedPrice: number,
    matchedAgainst?: Order,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.FILLED,
          matchedAt: new Date(),
          price: executedPrice,
        },
      });
  
      // 🧠 Dùng matchedAgainst để xác định người bán
      const sellerId =
        order.side === 'BUY'
          ? matchedAgainst?.userId ?? 'UNKNOWN'
          : order.userId;
  
          await this.txService.executeMatchedOrder(
            order,
            executedPrice,
            tx,
          matchedAgainst!,
          );
          
    });
  
    this.logger.log(
      `✔️ Matched order ${order.id} for ${order.ticker} @${executedPrice}`,
    );
  
    this.eventEmitter.emit('order.matched', { orderId: order.id });
  }
  
}
