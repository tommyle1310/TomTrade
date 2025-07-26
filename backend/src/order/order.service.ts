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

    this.logger.log(
      `🔎 Looking for ${oppositeSide} orders for ${order.ticker} with price ${priceComparator} ${order.price}`,
    );

    const candidates = await this.prisma.order.findMany({
      where: {
        ticker: order.ticker,
        status: OrderStatus.OPEN,
        side: oppositeSide,
        type: OrderType.LIMIT,
        price: { [priceComparator]: order.price },
      },
      orderBy: [{ price: priceOrder }, { createdAt: 'asc' }],
    });

    this.logger.log(
      `🔁 Matching order ${order.id} (${order.side}) → ${candidates.length} candidate(s)`,
    );

    if (candidates.length > 0) {
      this.logger.log(
        `Found candidates: ${JSON.stringify(candidates.map((c) => ({ id: c.id, price: c.price, side: c.side })))}`,
      );
    }

    if (candidates.length === 0) return;

    let remainingQty = order.quantity;

    for (const matched of candidates) {
      if (remainingQty <= 0) break;

      // Reload both orders
      const freshOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
      });
      const freshMatched = await this.prisma.order.findUnique({
        where: { id: matched.id },
      });

      if (
        !freshOrder ||
        freshOrder.status !== OrderStatus.OPEN ||
        !freshMatched ||
        freshMatched.status !== OrderStatus.OPEN
      )
        continue;

      const availableQty = Math.min(remainingQty, matched.quantity);

      // Check nếu SELL có đủ cổ phiếu
      if (order.side === 'BUY') {
        const sellerPortfolio = await this.prisma.portfolio.findUnique({
          where: {
            userId_ticker: {
              userId: matched.userId,
              ticker: matched.ticker,
            },
          },
        });

        if (!sellerPortfolio || sellerPortfolio.quantity < availableQty) {
          this.logger.warn(
            `⛔ Seller ${matched.userId} không đủ cổ phiếu để bán`,
          );
          continue;
        }
      }

      await this.executeTrade(
        order,
        matched,
        availableQty,
        matched.price, // lấy giá từ SELL order
      );

      remainingQty -= availableQty;

      // Update lại remaining order quantity nếu còn
      if (remainingQty <= 0) break;
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
      // Cập nhật order quantity còn lại
      const takerRemaining = taker.quantity - quantity;
      const makerRemaining = maker.quantity - quantity;

      this.logger.log(
        `Updating taker order ${taker.id} to status: ${takerRemaining === 0 ? OrderStatus.FILLED : OrderStatus.OPEN}`,
      );
      await tx.order.update({
        where: { id: taker.id },
        data: {
          status: takerRemaining === 0 ? OrderStatus.FILLED : OrderStatus.OPEN,
          matchedAt: new Date(),
          price: executedPrice,
        },
      });

      this.logger.log(
        `Updating maker order ${maker.id} to status: ${makerRemaining === 0 ? OrderStatus.FILLED : OrderStatus.OPEN}`,
      );
      await tx.order.update({
        where: { id: maker.id },
        data: {
          status: makerRemaining === 0 ? OrderStatus.FILLED : OrderStatus.OPEN,
          matchedAt: new Date(),
          price: executedPrice,
        },
      });

      const buyer = taker.side === 'BUY' ? taker.userId : maker.userId;
      const seller = taker.side === 'SELL' ? taker.userId : maker.userId;
      this.logger.log(`Buyer: ${buyer}, Seller: ${seller}`);

      const ticker = taker.ticker;
      const totalCost = quantity * executedPrice;

      // Update portfolio
      await this.portfolioService.increase(
        buyer,
        ticker,
        quantity,
        executedPrice,
      );
      await this.portfolioService.decrease(seller, ticker, quantity);

      // Update balance (trả tiền cho seller)
      await tx.balance.update({
        where: { userId: seller },
        data: { amount: { increment: totalCost } },
      });

      // Lưu giao dịch
      await this.txService.recordTrade(tx, {
        buyerId: buyer,
        sellerId: seller,
        ticker,
        price: executedPrice,
        quantity,
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
