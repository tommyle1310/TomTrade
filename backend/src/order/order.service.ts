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
import { OrderSide as OrderSideEnum } from './enums/order-side.enum';
import { BalanceService } from 'src/balance/balance.service'; // ✅ THÊM
import { PortfolioService } from 'src/portfolio/portfolio.service';

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
      orderBy: [
        { price: priceOrder }, // Ưu tiên giá tốt
        { createdAt: 'asc' }, // Ưu tiên thời gian sớm hơn
      ],
    });

    this.logger.log(
      `🔁 Matching LIMIT order ${order.id} (${order.side}) → found ${candidates.length} candidate(s)`,
    );

    if (candidates.length === 0) return;

    for (const matchedOrder of candidates) {
      // Check lại xem order gốc và đối ứng còn OPEN không
      const freshOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
      });
      const freshMatched = await this.prisma.order.findUnique({
        where: { id: matchedOrder.id },
      });

      if (
        !freshOrder ||
        freshOrder.status !== OrderStatus.OPEN ||
        !freshMatched ||
        freshMatched.status !== OrderStatus.OPEN
      )
        continue;

      const tradePrice = matchedOrder.price;

      // Khớp theo 2 chiều
      await this.matchOrder(freshMatched, tradePrice, freshOrder); // SELL, price, BUY
      await this.matchOrder(freshOrder, tradePrice, freshMatched); // BUY, price, SELL

      // Sau khi khớp xong mà order đã filled rồi thì break
      const updated = await this.prisma.order.findUnique({
        where: { id: order.id },
      });
      if (!updated || updated.status === OrderStatus.FILLED) break;
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

  private async matchOrder(
    order: Order,
    executedPrice: number,
    matchedAgainst?: Order,
  ) {
    const ticker = order.ticker; // 👈 FIX: Lấy ticker từ order

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.FILLED,
          matchedAt: new Date(),
          price: executedPrice,
        },
      });

      const buyerId =
        order.side === 'BUY'
          ? order.userId
          : (matchedAgainst?.userId ?? 'UNKNOWN');

      const sellerId =
        order.side === 'SELL'
          ? order.userId
          : (matchedAgainst?.userId ?? 'UNKNOWN');

      const quantity = order.quantity;
      const totalCost = executedPrice * quantity;

      // ✅ Trừ tiền người mua
      await this.balanceService.deduct(buyerId, totalCost);
      this.logger.log(`💰 Deducted ${totalCost} from buyer ${buyerId}`);

      // ✅ Cộng tiền người bán
      await this.balanceService.add(sellerId, totalCost);
      this.logger.log(`💰 Added ${totalCost} to seller ${sellerId}`);

      // ✅ Portfolio update
      await this.portfolioService.addStock(
        buyerId,
        ticker,
        quantity,
        executedPrice,
      );
      await this.portfolioService.removeStock(sellerId, ticker, quantity);

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

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId, status: OrderStatus.OPEN },
    });

    if (!order)
      throw new NotFoundException('Order not found or not cancellable.');

    await this.prisma.order.update({
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

    return true;
  }
}
