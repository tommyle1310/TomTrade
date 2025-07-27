import {
  PrismaClient,
  OrderSide,
  OrderStatus,
  OrderType,
  TransactionAction,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const ticker = 'AAPL';

  // 1. First, seed the Stock data (before creating portfolios that reference it)
  await prisma.stock.upsert({
    where: { ticker },
    update: {},
    create: {
      ticker,
      companyName: 'Apple Inc.',
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      marketCap: BigInt(3_000_000_000_000),
      outstandingShares: BigInt(16_000_000_000),
      insiderHolding: 0.02,
      institutionalHolding: 0.58,
      ipoDate: new Date('1980-12-12'),
      country: 'USA',
      currency: 'USD',
    },
  });
  console.log(`✅ Created stock: ${ticker}`);

  // 2. Seed existing demo user
  const plainPassword = 'password123';
  const hash = await bcrypt.hash(plainPassword, 8);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: hash,
    },
  });
  console.log(`✅ Created test user: ${user.email} / ${plainPassword}`);
  await prisma.balance.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      amount: 100000, // 100k USD để test mua cổ phiếu
    },
  });
  console.log(`✅ Seeded balance for ${user.email}`);

  // 3. Add users for the 'buy-limit-multiple-sell' test script
  const simplePassword = '123456';
  const passwordHash = await bcrypt.hash(simplePassword, 8);

  // --- Create Buyer ---
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      passwordHash,
    },
  });
  console.log(`✅ Created buyer user: ${buyer.email} / ${simplePassword}`);

  await prisma.balance.upsert({
    where: { userId: buyer.id },
    update: { amount: 100000 },
    create: {
      userId: buyer.id,
      amount: 100000, // 100k USD for buying stocks
    },
  });
  console.log(`✅ Seeded balance for ${buyer.email}`);

  // --- Create Sellers ---
  const sellersData = [
    { email: 'seller1@example.com', shares: 50 },
    { email: 'seller2@example.com', shares: 50 },
    { email: 'seller3@example.com', shares: 50 },
  ];

  for (const sellerData of sellersData) {
    const seller = await prisma.user.upsert({
      where: { email: sellerData.email },
      update: {},
      create: {
        email: sellerData.email,
        passwordHash,
      },
    });
    console.log(`✅ Created seller user: ${seller.email} / ${simplePassword}`);

    await prisma.balance.upsert({
      where: { userId: seller.id },
      update: { amount: 20000 },
      create: {
        userId: seller.id,
        amount: 20000, // 20k USD initial balance
      },
    });
    console.log(`✅ Seeded balance for ${seller.email}`);

    await prisma.portfolio.upsert({
      where: {
        userId_ticker: {
          userId: seller.id,
          ticker,
        },
      },
      update: {
        quantity: sellerData.shares,
        averagePrice: 180, // Bought at a lower price
      },
      create: {
        userId: seller.id,
        ticker,
        quantity: sellerData.shares,
        averagePrice: 180,
        positionType: 'LONG',
      },
    });
    console.log(`✅ Seeded portfolio for ${seller.email}`);
  }

  // 4. Seed MarketData
  for (let i = 0; i < 10; i++) {
    await prisma.marketData.create({
      data: {
        ticker,
        timestamp: new Date(now.getTime() - i * 86400000),
        interval: '1d',
        open: 150 + i,
        high: 155 + i,
        low: 145 + i,
        close: 152 + i,
        volume: BigInt(1_000_000 + i * 10000),
        afterHours: 151 + i,
      },
    });
  }

  // 5. Seed News
  for (let i = 0; i < 5; i++) {
    await prisma.news.create({
      data: {
        ticker,
        headline: `AAPL News #${i}`,
        summary: `Summary of news ${i}`,
        url: `https://news.example.com/aapl-${i}`,
        source: 'Example News',
        sentimentScore: Math.random() * 2 - 1,
        type: 'Financial',
        publishedAt: new Date(now.getTime() - i * 86400000),
      },
    });
  }

  // 6. Seed Dividends
  for (let i = 0; i < 4; i++) {
    const exDate = new Date(now.getTime() - i * 90 * 86400000);
    const payDate = new Date(exDate.getTime() + 15 * 86400000);
    await prisma.dividend.create({
      data: {
        ticker,
        exDate,
        payDate,
        amount: parseFloat((Math.random() * 2).toFixed(2)),
        frequency: 'QUARTERLY',
      },
    });
  }

  // 7. Seed Forecast Models
  for (let i = 0; i < 3; i++) {
    await prisma.forecastModel.create({
      data: {
        ticker,
        modelType: 'LSTM',
        prediction: parseFloat((150 + Math.random() * 50).toFixed(2)),
        confidenceScore: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
        trainedAt: new Date(now.getTime() - i * 30 * 86400000),
      },
    });
  }

  // 8. Seed Orders for demo user: LIMIT và MARKET
  await prisma.order.createMany({
    data: [
      {
        userId: user.id,
        ticker,
        side: OrderSide.BUY,
        price: 280,
        quantity: 10,
        type: OrderType.LIMIT,
        status: OrderStatus.OPEN,
        createdAt: now,
      },
      {
        userId: user.id,
        ticker,
        side: OrderSide.SELL,
        price: 320,
        quantity: 10,
        type: OrderType.LIMIT,
        status: OrderStatus.OPEN,
        createdAt: now,
      },
      {
        userId: user.id,
        ticker,
        side: OrderSide.BUY,
        price: 300,
        quantity: 5,
        type: OrderType.MARKET,
        status: OrderStatus.FILLED,
        matchedAt: now,
        createdAt: now,
      },
    ],
  });

  // 9. Seed Transaction for demo user
  await prisma.transaction.create({
    data: {
      userId: user.id,
      ticker,
      action: TransactionAction.BUY,
      price: 300,
      shares: 5,
      timestamp: now,
    },
  });

  // 10. Seed Portfolio for demo user
  await prisma.portfolio.upsert({
    where: {
      userId_ticker: {
        userId: user.id,
        ticker,
      },
    },
    update: {
      quantity: { increment: 50 },
      averagePrice: 300,
    },
    create: {
      userId: user.id,
      ticker,
      quantity: 50,
      averagePrice: 300,
      positionType: 'LONG',
    },
  });

  // 11. Add some additional orders for demo user
  await prisma.order.createMany({
    data: [
      {
        userId: user.id,
        ticker: 'AAPL',
        side: 'SELL',
        price: 295,
        quantity: 10,
        status: 'OPEN',
        type: 'LIMIT',
      },
      {
        userId: user.id,
        ticker: 'AAPL',
        side: 'BUY',
        price: 280,
        quantity: 8,
        status: 'OPEN',
        type: 'LIMIT',
      },
    ],
  });

  console.log('✅ Seeded Stock, MarketData, News, Dividends, ForecastModels');
  console.log(
    '✅ Seeded Users (demo, buyer, seller1, seller2, seller3), Transactions, Portfolios',
  );
}

main()
  .catch((e) => {
    console.error('❌ SEED ERROR:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
