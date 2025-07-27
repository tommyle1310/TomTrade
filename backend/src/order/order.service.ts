import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PlaceOrderInput } from './dto/place-order.input';
import { TransactionService } from 'src/transaction/transaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus, OrderType, OrderSide } from '@prisma/client';
import { Order as OrderEntity } from './entities/order.entity';
import { OrderSide as OrderSideEnum } from './enums/order-side.enum';
import { BalanceService } from 'src/balance/balance.service'; // ✅ THÊM
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { OrderBook } from 'src/order-book/entities/order-book.entity';
import { OrderStatus as OrderStatusEnum } from './enums/order-status.enum';

@Injectable()
export class OrderService {
  private logger = new Logger('OrderService');

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TransactionService))
    private txService: TransactionService,
    private portfolioService: PortfolioService,
    private eventEmitter: EventEmitter2,
    private balanceService: BalanceService, // ✅ THÊM
  ) {}

  onModuleInit() {
    this.eventEmitter.on('order.matched', ({ orderId }) => {
      this.logger.log(`Order matched event received: ${orderId}`);
    });
  }

  async placeOrder(userId: string, input: PlaceOrderInput): Promise<Order> {
    const { side, ticker, quantity, price, type } = input;

    if (side === OrderSideEnum.BUY) {
      const cost = price * quantity;
      const balance = await this.prisma.balance.findUnique({
        where: { userId },
      });

      if (!balance || balance.amount < cost) {
        throw new Error('❌ Insufficient balance to place BUY order.');
      }

      await this.prisma.balance.update({
        where: { userId },
        data: { amount: { decrement: cost } },
      });
    }

    if (side === OrderSideEnum.SELL) {
      const holding = await this.prisma.portfolio.findFirst({
        where: { userId, ticker },
      });

      if (!holding || holding.quantity < quantity) {
        throw new Error('❌ Not enough shares to place SELL order.');
      }

      // (Tuỳ logic) Có thể lock cổ phiếu ở đây nếu cần
    }

    const order = await this.prisma.order.create({
      data: { ...input, userId },
    });

    // Khớp lệnh sau khi tạo
    await this.tryMatchByOrder(order);

    // Với lệnh MARKET, có thể gọi lại 1 lần nữa vì giá tự động
    if (type === OrderType.MARKET) {
      await this.tryMatchByOrder(order);

      const updated = await this.prisma.order.findUnique({
        where: { id: order.id },
      });
      if (!updated) throw new Error('❌ Order not found');
      return updated;
    }

    return order;
  }

  async tryMatchByOrder(order: Order) {
    const oppositeSide: OrderSide = order.side === 'BUY' ? 'SELL' : 'BUY';
    const priceOrder = order.side === 'BUY' ? 'asc' : 'desc';

    const priceFilter =
      order.type === OrderType.MARKET
        ? {}
        : {
            price:
              order.side === 'BUY'
                ? { lte: order.price }
                : { gte: order.price },
          };

    const candidates = await this.prisma.order.findMany({
      where: {
        ticker: order.ticker,
        status: OrderStatus.OPEN,
        side: oppositeSide,
        type: OrderType.LIMIT,
        ...priceFilter,
      },
      orderBy: [{ price: priceOrder }, { createdAt: 'asc' }],
    });

    if (!candidates.length) return;

    for (const matched of candidates) {
      // ⚠️ Always fetch the fresh latest version of the taker
      const freshOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
      });

      if (!freshOrder || freshOrder.status !== OrderStatus.OPEN) break;

      const freshMatched = await this.prisma.order.findUnique({
        where: { id: matched.id },
      });

      if (!freshMatched || freshMatched.status !== OrderStatus.OPEN) continue;

      const availableQty = Math.min(freshOrder.quantity, freshMatched.quantity);

      // ✅ Check SELLER has enough stock
      const sellerId =
        freshOrder.side === 'BUY' ? freshMatched.userId : freshOrder.userId;

      const sellerPortfolio = await this.prisma.portfolio.findUnique({
        where: {
          userId_ticker: {
            userId: sellerId,
            ticker: freshOrder.ticker,
          },
        },
      });

      if (!sellerPortfolio || sellerPortfolio.quantity < availableQty) {
        this.logger.warn(`⛔ Seller ${sellerId} không đủ cổ phiếu để bán`);
        continue;
      }

      await this.executeTrade(
        freshOrder,
        freshMatched,
        availableQty,
        freshMatched.price,
      );
    }
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

    const limitOrders = await this.prisma.order.findMany({
      where: {
        ticker,
        status: OrderStatus.OPEN,
        type: OrderType.LIMIT,
        price: { lte: currentPrice },
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const order of limitOrders) {
      await this.tryMatchByOrder(order);
    }

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

  private async executeTrade(
    taker: Order,
    maker: Order,
    quantity: number,
    executedPrice: number,
  ) {
    this.logger.log(
      `🔄 Executing trade: ${taker.id} (${taker.side}) <-> ${maker.id} (${maker.side}) for ${quantity} @ ${executedPrice}`,
    );

    await this.prisma.$transaction(async (tx) => {
      const takerRemaining = taker.quantity - quantity;
      const makerRemaining = maker.quantity - quantity;

      const takerStatus =
        takerRemaining === 0
          ? OrderStatus.FILLED
          : takerRemaining < taker.quantity
            ? OrderStatus.PARTIAL
            : OrderStatus.OPEN;

      const makerStatus =
        makerRemaining === 0
          ? OrderStatus.FILLED
          : makerRemaining < maker.quantity
            ? OrderStatus.PARTIAL
            : OrderStatus.OPEN;

      // Update taker
      await tx.order.update({
        where: { id: taker.id },
        data: {
          quantity: takerRemaining,
          status: takerStatus,
          matchedAt: new Date(),
        },
      });

      // Update maker
      await tx.order.update({
        where: { id: maker.id },
        data: {
          quantity: makerRemaining,
          status: makerStatus,
          matchedAt: new Date(),
        },
      });

      const buyerId = taker.side === 'BUY' ? taker.userId : maker.userId;
      const sellerId = taker.side === 'SELL' ? taker.userId : maker.userId;
      const ticker = taker.ticker;
      const totalCost = quantity * executedPrice;

      // Update portfolios
      await this.portfolioService.increase(
        buyerId,
        ticker,
        quantity,
        executedPrice,
      );
      await this.portfolioService.decrease(sellerId, ticker, quantity);

      // Update seller balance
      await tx.balance.update({
        where: { userId: sellerId },
        data: { amount: { increment: totalCost } },
      });

      // Record transaction
      await this.txService.recordTrade(tx, {
        buyerId,
        sellerId,
        ticker,
        quantity,
        price: executedPrice,
      });
    });

    this.logger.log(
      `✔️ Executed trade ${taker.id} <-> ${maker.id} for ${quantity} @${executedPrice}`,
    );
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId, status: OrderStatus.OPEN },
    });

    if (!order)
      throw new NotFoundException('Order not found or not cancellable.');
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    if (order.side === 'BUY') {
      const refund = order.price * order.quantity;
      await this.prisma.balance.update({
        where: { userId },
        data: { amount: { increment: refund } },
      });
    }

    return updatedOrder;
  }

  async getOrderBook(ticker: string): Promise<OrderBook> {
    const [buyOrdersRaw, sellOrdersRaw] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          ticker,
          status: 'OPEN',
          side: 'BUY',
        },
        orderBy: [{ price: 'desc' }, { createdAt: 'asc' }],
      }),
      this.prisma.order.findMany({
        where: {
          ticker,
          status: 'OPEN',
          side: 'SELL',
        },
        orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
      }),
    ]);

    // Convert enums to internal enums
    const mapOrder = (o: Order): OrderEntity => ({
      ...o,
      side: OrderSideEnum[o.side],
      status: OrderStatus[o.status] as OrderStatusEnum,
      type: OrderType[o.type],
      matchedAt: o.matchedAt || undefined,
    });

    return {
      buyOrders: buyOrdersRaw.map(mapOrder),
      sellOrders: sellOrdersRaw.map(mapOrder),
    };
  }
}
