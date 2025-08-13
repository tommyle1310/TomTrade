import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PlaceOrderInput } from './dto/place-order.input';
import { PlaceStopOrderInput } from './dto/place-stop-order.input';
import { TransactionService } from 'src/transaction/transaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus, OrderType, OrderSide } from '@prisma/client';
import { Order as OrderEntity } from './entities/order.entity';
import { OrderSide as OrderSideEnum } from './enums/order-side.enum';
import { BalanceService } from 'src/balance/balance.service';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { OrderBook } from 'src/order-book/entities/order-book.entity';
import { OrderStatus as OrderStatusEnum } from './enums/order-status.enum';
import { TimeInForce } from './enums/time-in-force.enum';
import { SocketService } from 'src/core/socket-gateway.service';
import { PortfolioPnLService } from '../portfolio/portfolio-pnl.service';
import { RiskService } from '../risk/risk.service';

@Injectable()
export class OrderService {
  private logger = new Logger('OrderService');

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TransactionService))
    private txService: TransactionService,
    private portfolioService: PortfolioService,
    private eventEmitter: EventEmitter2,
    private balanceService: BalanceService,
    private socketService: SocketService,
    private portfolioPnLService: PortfolioPnLService,
    private riskService: RiskService,
  ) {}

  onModuleInit() {
    this.eventEmitter.on('order.matched', ({ orderId }) => {
      this.logger.log(`Order matched event received: ${orderId}`);
    });

    // Debug: Check if SocketService is properly injected
    this.logger.log(
      '🔧 OrderService.onModuleInit - socketService instance:',
      this.socketService ? 'injected' : 'null',
    );
    this.logger.log(
      '🔧 OrderService.onModuleInit - socketService.server:',
      this.socketService?.server ? 'initialized' : 'not initialized',
    );
  }

  async placeOrder(userId: string, input: PlaceOrderInput): Promise<Order> {
    const { side, ticker, quantity, price, type } = input;

    // Risk management validation
    const positionSizeValidation = await this.riskService.validatePositionSize(
      userId,
      ticker,
      quantity,
      price,
    );
    if (!positionSizeValidation.isValid) {
      throw new Error(
        `❌ Risk validation failed: ${positionSizeValidation.message}`,
      );
    }

    const riskPerTradeValidation = await this.riskService.validateRiskPerTrade(
      userId,
      ticker,
      quantity,
      price,
    );
    if (!riskPerTradeValidation.isValid) {
      throw new Error(
        `❌ Risk validation failed: ${riskPerTradeValidation.message}`,
      );
    }

    if (side === OrderSideEnum.BUY) {
      const cost = price * quantity;
      const balance = await this.prisma.balance.findUnique({
        where: { userId },
      });

      if (!balance || balance.amount < cost) {
        throw new Error('❌ Insufficient balance to place BUY order.');
      }

      // Note: Balance is NOT deducted here - only checked for availability
      // Balance will be deducted when the order actually executes in executeTrade
      this.logger.log(`✅ Balance check passed: ${balance.amount} >= ${cost}`);
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

    this.logger.log(
      `📝 Order created: ${order.id} - ${side} ${quantity} ${ticker} @ ${price}`,
    );

    // CRITICAL FIX: Only try to match once to prevent duplicate executions
    await this.tryMatchByOrder(order);

    // CRITICAL FIX: Remove the second matching call for MARKET orders
    // This was causing duplicate executions
    if (type === OrderType.MARKET) {
      // For MARKET orders, we already tried matching above
      // No need to call it again
      this.logger.log(`📈 MARKET order processed - matching already attempted`);
    }

    // CRITICAL FIX: Remove automatic retry of partial orders
    // This was causing extra trades when partial orders were retried unnecessarily
    // Partial orders will be matched naturally when new orders are placed
    // await this.retryMatchingPartialOrders(ticker);

    // Check final order status
    const finalOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
    });
    this.logger.log(
      `📊 Order final status: ${finalOrder?.status}, remaining quantity: ${finalOrder?.quantity}`,
    );

    return finalOrder || order;
  }

  async placeStopOrder(
    userId: string,
    input: PlaceStopOrderInput,
  ): Promise<Order> {
    const { side, ticker, quantity, price, triggerPrice, type } = input;

    // Validate STOP order type
    if (type !== 'STOP_LIMIT' && type !== 'STOP_MARKET') {
      throw new Error('❌ Invalid order type for STOP order.');
    }

    // For STOP orders, we don't reserve balance/shares until triggered
    // But we validate that the user has sufficient resources for when it triggers
    if (side === OrderSideEnum.BUY) {
      const cost = price * quantity;
      const balance = await this.prisma.balance.findUnique({
        where: { userId },
      });

      if (!balance || balance.amount < cost) {
        throw new Error('❌ Insufficient balance for STOP BUY order.');
      }
    }

    if (side === OrderSideEnum.SELL) {
      const holding = await this.prisma.portfolio.findFirst({
        where: { userId, ticker },
      });

      if (!holding || holding.quantity < quantity) {
        throw new Error('❌ Not enough shares for STOP SELL order.');
      }
    }

    // Validate trigger price logic
    if (side === OrderSideEnum.BUY && triggerPrice <= price) {
      throw new Error(
        '❌ For BUY STOP orders, trigger price must be higher than limit price.',
      );
    }

    if (side === OrderSideEnum.SELL && triggerPrice >= price) {
      throw new Error(
        '❌ For SELL STOP orders, trigger price must be lower than limit price.',
      );
    }

    const order = await this.prisma.order.create({
      data: {
        ...input,
        userId,
        triggerPrice,
      },
    });

    this.logger.log(
      `STOP order placed: ${order.id} for ${ticker} at trigger price $${triggerPrice}`,
    );

    return order;
  }

  async tryMatchByOrder(order: Order) {
    this.logger.log(
      `🔍 Trying to match order: ${order.id} - ${order.side} ${order.quantity} ${order.ticker} @ ${order.price}`,
    );

    // CRITICAL FIX: Use transaction to prevent race conditions and duplicate executions
    return await this.prisma.$transaction(async (tx) => {
      // Re-check order status within transaction to prevent duplicate processing
      const currentOrder = await tx.order.findUnique({
        where: { id: order.id },
        select: { status: true, quantity: true },
      });

      if (!currentOrder || currentOrder.status !== OrderStatus.OPEN) {
        this.logger.log(
          `⚠️ Order ${order.id} is no longer OPEN (status: ${currentOrder?.status}), skipping matching`,
        );
        return;
      }

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

      this.logger.log(
        `🔎 Looking for ${oppositeSide} orders for ${order.ticker} with price filter:`,
        priceFilter,
      );

      const candidates = await tx.order.findMany({
        where: {
          ticker: order.ticker,
          status: OrderStatus.OPEN,
          side: oppositeSide,
          type: OrderType.LIMIT,
          ...priceFilter,
        },
        orderBy: [{ price: priceOrder }, { createdAt: 'asc' }],
      });

      this.logger.log(
        `📋 Found ${candidates.length} matching candidates for order ${order.id}`,
      );

      if (candidates.length > 0) {
        candidates.forEach((candidate, index) => {
          this.logger.log(
            `  ${index + 1}. Order ${candidate.id}: ${candidate.side} ${candidate.quantity} @ ${candidate.price}`,
          );
        });
      }

      if (!candidates.length) {
        this.logger.log(`❌ No matching orders found for ${order.id}`);
        // Handle FOK orders that don't get any matches
        if (order.timeInForce === TimeInForce.FOK) {
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED },
          });
          this.logger.log(
            `❌ FOK order ${order.id} cancelled - no matches found`,
          );
        }
        return;
      }

      let totalMatched = 0;
      const originalQuantity = currentOrder.quantity;

      for (const matched of candidates) {
        // Re-check both orders within transaction to prevent race conditions
        const freshOrder = await tx.order.findUnique({
          where: { id: order.id },
        });

        if (!freshOrder || freshOrder.status !== OrderStatus.OPEN) {
          this.logger.log(
            `⚠️ Order ${order.id} no longer OPEN, stopping matching`,
          );
          break;
        }

        const freshMatched = await tx.order.findUnique({
          where: { id: matched.id },
        });

        if (!freshMatched || freshMatched.status !== OrderStatus.OPEN) {
          this.logger.log(
            `⚠️ Matched order ${matched.id} no longer OPEN, skipping`,
          );
          continue;
        }

        const availableQty = Math.min(
          freshOrder.quantity,
          freshMatched.quantity,
        );

        if (availableQty <= 0) {
          this.logger.log(
            `⚠️ No available quantity for trade between ${freshOrder.id} and ${freshMatched.id}`,
          );
          continue;
        }

        // ✅ Check SELLER has enough stock
        const sellerId =
          freshOrder.side === 'BUY' ? freshMatched.userId : freshOrder.userId;

        const sellerPortfolio = await tx.portfolio.findUnique({
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

        // Execute trade within the same transaction
        await this.executeTradeInTransaction(
          tx,
          freshOrder,
          freshMatched,
          availableQty,
          freshMatched.price,
        );

        totalMatched += availableQty;

        // Handle IOC orders - cancel remaining quantity after ANY partial fill
        if (
          order.timeInForce === TimeInForce.IOC &&
          totalMatched > 0 &&
          totalMatched < originalQuantity
        ) {
          const remainingQty = originalQuantity - totalMatched;
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: OrderStatus.CANCELLED,
              quantity: remainingQty,
            },
          });
          this.logger.log(
            `🔄 IOC order ${order.id} partially filled, remaining ${remainingQty} cancelled`,
          );
          break;
        }

        // Handle FOK orders - if not fully filled, cancel the entire order
        if (
          order.timeInForce === TimeInForce.FOK &&
          totalMatched < originalQuantity
        ) {
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED },
          });
          this.logger.log(
            `❌ FOK order ${order.id} cancelled - not fully filled`,
          );
          break;
        }
      }

      // Handle GTC orders - keep OPEN if not fully filled
      if (
        order.timeInForce === TimeInForce.GTC &&
        totalMatched < originalQuantity
      ) {
        this.logger.log(
          `⏳ GTC order ${order.id} partially filled, remaining OPEN`,
        );
      }
    });
  }

  async tryMatchByPrice(ticker: string, currentPrice: number) {
    // CRITICAL FIX: Only process orders that are still OPEN
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

    // CRITICAL FIX: Process orders one by one to prevent race conditions
    for (const order of limitOrders) {
      // Double-check order is still OPEN before processing
      const currentOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
        select: { status: true },
      });

      if (currentOrder && currentOrder.status === OrderStatus.OPEN) {
        await this.tryMatchByOrder(order);
      }
    }

    for (const order of candidates) {
      // Double-check order is still OPEN before processing
      const currentOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
        select: { status: true },
      });

      if (currentOrder && currentOrder.status === OrderStatus.OPEN) {
        await this.tryMatchByOrder({ ...order, price: currentPrice });
      }
    }
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private sentNotifications = new Set<string>();

  private async executeTradeInTransaction(
    tx: Prisma.TransactionClient,
    taker: Order,
    maker: Order,
    quantity: number,
    executedPrice: number,
  ) {
    this.logger.log(
      `🔄 Executing trade in transaction: ${taker.id} (${taker.side}) <-> ${maker.id} (${maker.side}) for ${quantity} @ ${executedPrice}`,
    );

    let takerStatus: OrderStatus;
    let makerStatus: OrderStatus;

    const takerRemaining = taker.quantity - quantity;
    const makerRemaining = maker.quantity - quantity;

    takerStatus =
      takerRemaining === 0
        ? OrderStatus.FILLED
        : takerRemaining < taker.quantity
          ? OrderStatus.PARTIAL
          : OrderStatus.OPEN;

    makerStatus =
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

    // CRITICAL FIX: Check buyer has sufficient balance before executing trade
    const buyerBalance = await tx.balance.findUnique({
      where: { userId: buyerId },
    });

    if (!buyerBalance || buyerBalance.amount < totalCost) {
      throw new Error(
        `❌ Buyer ${buyerId} has insufficient balance for trade: ${buyerBalance?.amount || 0} < ${totalCost}`,
      );
    }

    // CRITICAL FIX: Update buyer balance (deduct cost) within transaction
    await tx.balance.update({
      where: { userId: buyerId },
      data: { amount: { decrement: totalCost } },
    });

    // CRITICAL FIX: Update seller balance (add proceeds) within transaction
    await tx.balance.update({
      where: { userId: sellerId },
      data: { amount: { increment: totalCost } },
    });

    // Update portfolios using transaction client
    await this.portfolioService.upsertPortfolio(
      tx,
      buyerId,
      ticker,
      quantity,
      executedPrice,
    );
    await this.portfolioService.updatePortfolioOnSell(
      tx,
      sellerId,
      ticker,
      quantity,
    );

    // Record transaction
    await this.txService.recordTrade(tx, {
      buyerId,
      sellerId,
      ticker,
      quantity,
      price: executedPrice,
    });

    this.logger.log(
      `✔️ Executed trade ${taker.id} <-> ${maker.id} for ${quantity} @${executedPrice}`,
    );

    // CRITICAL FIX: Send notifications immediately after transaction completes
    // This ensures we send the updated data, not stale data
    this.sendOrderNotifications(
      taker,
      maker,
      quantity,
      executedPrice,
      takerStatus,
      makerStatus,
    );
  }

  private async executeTrade(
    taker: Order,
    maker: Order,
    quantity: number,
    executedPrice: number,
  ) {
    // This method is now deprecated - use executeTradeInTransaction instead
    // But keeping it for backward compatibility
    this.logger.warn(
      '⚠️ executeTrade is deprecated, use executeTradeInTransaction instead',
    );

    // Send notifications outside transaction to prevent duplicates
    this.sendOrderNotifications(
      taker,
      maker,
      quantity,
      executedPrice,
      taker.status,
      maker.status,
    );
  }

  private async sendOrderNotifications(
    taker: Order,
    maker: Order,
    quantity: number,
    executedPrice: number,
    takerStatus: OrderStatus,
    makerStatus: OrderStatus,
  ) {
    this.logger.log(
      `🔄 sendOrderNotifications called for trade: ${taker.id} <-> ${maker.id}`,
    );

    // Create unique notification IDs that include the trade execution timestamp
    const tradeTimestamp = Date.now();
    const takerNotificationId = `${taker.id}-${takerStatus}-${quantity}-${executedPrice}-${tradeTimestamp}`;
    const makerNotificationId = `${maker.id}-${makerStatus}-${quantity}-${executedPrice}-${tradeTimestamp}`;

    // Prevent duplicate notifications for each user
    if (this.sentNotifications.has(takerNotificationId)) {
      this.logger.log(
        `⚠️ Skipping duplicate taker notification: ${takerNotificationId}`,
      );
    } else {
      this.sentNotifications.add(takerNotificationId);

      // Send notification to taker
      const takerNotificationType =
        takerStatus === OrderStatus.FILLED
          ? 'ORDER_FILLED'
          : takerStatus === OrderStatus.PARTIAL
            ? 'ORDER_PARTIAL'
            : 'ORDER_CANCELLED';

      this.logger.log(
        `📤 Sending notification to taker ${taker.userId}: ${takerNotificationType}`,
      );

      // Debug: Check if socket service is available
      if (!this.socketService) {
        this.logger.error('❌ SocketService is not injected!');
        return;
      }

      if (!this.socketService.server) {
        this.logger.error('❌ SocketService server is not initialized!');
        return;
      }

      this.socketService.sendOrderNotification(taker.userId, {
        type: takerNotificationType as
          | 'ORDER_FILLED'
          | 'ORDER_PARTIAL'
          | 'ORDER_CANCELLED',
        orderId: taker.id,
        ticker: taker.ticker,
        side: taker.side,
        quantity,
        price: executedPrice,
        message: `${taker.side} order for ${quantity} ${taker.ticker} @ $${executedPrice} was ${takerStatus.toLowerCase()}`,
      });

      this.logger.log(
        `✅ Sent notification to taker ${taker.userId}: ${takerNotificationId}`,
      );
    }

    if (this.sentNotifications.has(makerNotificationId)) {
      this.logger.log(
        `⚠️ Skipping duplicate maker notification: ${makerNotificationId}`,
      );
    } else {
      this.sentNotifications.add(makerNotificationId);

      // Send notification to maker
      const makerNotificationType =
        makerStatus === OrderStatus.FILLED
          ? 'ORDER_FILLED'
          : makerStatus === OrderStatus.PARTIAL
            ? 'ORDER_PARTIAL'
            : 'ORDER_CANCELLED';

      this.logger.log(
        `📤 Sending notification to maker ${maker.userId}: ${makerNotificationType}`,
      );
      this.socketService.sendOrderNotification(maker.userId, {
        type: makerNotificationType as
          | 'ORDER_FILLED'
          | 'ORDER_PARTIAL'
          | 'ORDER_CANCELLED',
        orderId: maker.id,
        ticker: maker.ticker,
        side: maker.side,
        quantity,
        price: executedPrice,
        message: `${maker.side} order for ${quantity} ${maker.ticker} @ $${executedPrice} was ${makerStatus.toLowerCase()}`,
      });

      this.logger.log(
        `✅ Sent notification to maker ${maker.userId}: ${makerNotificationId}`,
      );
    }

    // Send portfolio and balance updates to both users immediately
    try {
      this.logger.log(
        `📊 Sending portfolio/balance updates to taker ${taker.userId}`,
      );
      // Get portfolio data for taker
      const takerPortfolioData =
        await this.portfolioPnLService.calculatePortfolioPnL(taker.userId, {
          [taker.ticker]: executedPrice,
        });
      const takerBalance = await this.balanceService.getBalance(taker.userId);

      await this.socketService.sendPortfolioUpdate(taker.userId, {
        totalValue: takerPortfolioData.totalAssets, // CRITICAL FIX: Send totalAssets (stocks + cash) instead of totalPortfolioValue
        totalPnL: takerPortfolioData.totalPnL,
        positions: takerPortfolioData.positions,
      });
      await this.socketService.sendBalanceUpdate(taker.userId, {
        balance: takerBalance,
        totalAssets: takerPortfolioData.totalAssets,
      });
      this.logger.log(
        `✅ Sent portfolio/balance updates to taker ${taker.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send portfolio/balance updates to taker ${taker.userId}:`,
        error,
      );
    }

    try {
      this.logger.log(
        `📊 Sending portfolio/balance updates to maker ${maker.userId}`,
      );
      // Get portfolio data for maker
      const makerPortfolioData =
        await this.portfolioPnLService.calculatePortfolioPnL(maker.userId, {
          [maker.ticker]: executedPrice,
        });
      const makerBalance = await this.balanceService.getBalance(maker.userId);

      await this.socketService.sendPortfolioUpdate(maker.userId, {
        totalValue: makerPortfolioData.totalAssets, // CRITICAL FIX: Send totalAssets (stocks + cash) instead of totalPortfolioValue
        totalPnL: makerPortfolioData.totalPnL,
        positions: makerPortfolioData.positions,
      });
      await this.socketService.sendBalanceUpdate(maker.userId, {
        balance: makerBalance,
        totalAssets: makerPortfolioData.totalAssets,
      });
      this.logger.log(
        `✅ Sent portfolio/balance updates to maker ${maker.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send portfolio/balance updates to maker ${maker.userId}:`,
        error,
      );
    }
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

    // Note: No balance refund needed for BUY orders since balance is not pre-deducted
    // Balance is only deducted when trades actually execute
    this.logger.log(`📋 Order ${orderId} cancelled - no balance refund needed`);

    // Send order cancellation notification
    this.socketService.sendOrderNotification(userId, {
      type: 'ORDER_CANCELLED',
      orderId: order.id,
      ticker: order.ticker,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      message: `${order.side} order for ${order.quantity} ${order.ticker} @ $${order.price} was cancelled`,
    });

    // TODO: If implementing a reservation system in the future,
    // release reserved funds here for BUY orders

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
      timeInForce: o.timeInForce as TimeInForce,
      matchedAt: o.matchedAt || undefined,
    });

    return {
      buyOrders: buyOrdersRaw.map(mapOrder),
      sellOrders: sellOrdersRaw.map(mapOrder),
    };
  }

  // CRITICAL FIX: Retry matching for partial orders
  private async retryMatchingPartialOrders(ticker: string) {
    try {
      // Find all partial orders for this ticker
      const partialOrders = await this.prisma.order.findMany({
        where: {
          ticker,
          status: OrderStatus.PARTIAL,
        },
      });

      this.logger.log(
        `🔄 Retrying matching for ${partialOrders.length} partial orders in ${ticker}`,
      );

      // Try to match each partial order
      for (const partialOrder of partialOrders) {
        if (partialOrder.quantity > 0) {
          this.logger.log(
            `🔄 Retrying match for partial order ${partialOrder.id} (${partialOrder.quantity} remaining)`,
          );
          await this.tryMatchByOrder(partialOrder);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error retrying partial order matching:`, error);
    }
  }

  // CRITICAL FIX: Manually trigger order matching for any remaining open orders
  async triggerOrderMatching(ticker: string) {
    try {
      this.logger.log(`🔄 Manually triggering order matching for ${ticker}`);

      // Find all open orders for this ticker
      const openOrders = await this.prisma.order.findMany({
        where: {
          ticker,
          status: OrderStatus.OPEN,
        },
        orderBy: [{ createdAt: 'asc' }],
      });

      this.logger.log(
        `📋 Found ${openOrders.length} open orders for ${ticker}`,
      );

      // Try to match each open order
      for (const openOrder of openOrders) {
        this.logger.log(
          `🔄 Triggering match for open order ${openOrder.id} (${openOrder.side} ${openOrder.quantity} @ ${openOrder.price})`,
        );
        await this.tryMatchByOrder(openOrder);
      }
    } catch (error) {
      this.logger.error(`❌ Error triggering order matching:`, error);
    }
  }
}
