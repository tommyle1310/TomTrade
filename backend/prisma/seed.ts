import { PrismaClient, OrderSide, OrderStatus, OrderType, TransactionAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const ticker = 'AAPL';

  // 1. Seed User demo
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


  // 3. Seed MarketData
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

  // 4. Seed News
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

  // 5. Seed Dividends
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

  // 6. Seed Forecast Models
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

  // 7. Seed Orders: LIMIT và MARKET
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

  // 8. Seed Transaction tương ứng với MARKET BUY
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

  // 9. Seed Portfolio sau MARKET BUY
  await prisma.portfolio.upsert({
    where: {
      userId_ticker: {
        userId: user.id,
        ticker,
      },
    },
    update: {
      quantity: { increment: 50 }, // 🆙 Tăng lên nhiều
      averagePrice: 300,
    },
    create: {
      userId: user.id,
      ticker,
      quantity: 50, // 🆙 Nhiều hơn số SELL LIMIT
      averagePrice: 300,
      positionType: 'LONG',
    },
  });
  

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
  console.log('✅ Seeded User, Orders (LIMIT + MARKET), Transactions, Portfolio');
}

main()
  .catch((e) => {
    console.error('❌ SEED ERROR:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
