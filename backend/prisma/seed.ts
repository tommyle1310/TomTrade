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
  const stocks = [
    {
      ticker: 'AAPL',
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
      avatar: 'https://financialmodelingprep.com/image-stock/AAPL.png',
    },
    {
      ticker: 'GOOG',
      companyName: 'Alphabet Inc.',
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Internet Content & Information',
      marketCap: BigInt(2_500_000_000_000),
      outstandingShares: BigInt(12_000_000_000),
      insiderHolding: 0.01,
      institutionalHolding: 0.65,
      ipoDate: new Date('2004-08-19'),
      country: 'USA',
      currency: 'USD',
      avatar: 'https://financialmodelingprep.com/image-stock/GOOG.png',
    },
    {
      ticker: 'MSFT',
      companyName: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Software',
      marketCap: BigInt(2_800_000_000_000),
      outstandingShares: BigInt(7_400_000_000),
      insiderHolding: 0.01,
      institutionalHolding: 0.72,
      ipoDate: new Date('1986-03-13'),
      country: 'USA',
      currency: 'USD',
      avatar: 'https://financialmodelingprep.com/image-stock/MSFT.png',
    },
    {
      ticker: 'TSLA',
      companyName: 'Tesla, Inc.',
      exchange: 'NASDAQ',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      marketCap: BigInt(800_000_000_000),
      outstandingShares: BigInt(3_200_000_000),
      insiderHolding: 0.13,
      institutionalHolding: 0.44,
      ipoDate: new Date('2010-06-29'),
      country: 'USA',
      currency: 'USD',
      avatar: 'https://financialmodelingprep.com/image-stock/TSLA.png',
    },
    {
      ticker: 'AMZN',
      companyName: 'Amazon.com, Inc.',
      exchange: 'NASDAQ',
      sector: 'Consumer Cyclical',
      industry: 'Internet Retail',
      marketCap: BigInt(1_500_000_000_000),
      outstandingShares: BigInt(10_500_000_000),
      insiderHolding: 0.1,
      institutionalHolding: 0.58,
      ipoDate: new Date('1997-05-15'),
      country: 'USA',
      currency: 'USD',
      avatar: 'https://financialmodelingprep.com/image-stock/AMZN.png',
    },
    {
      ticker: 'NVDA',
      companyName: 'NVIDIA Corporation',
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Semiconductors',
      marketCap: BigInt(1_800_000_000_000),
      outstandingShares: BigInt(24_700_000_000),
      insiderHolding: 0.04,
      institutionalHolding: 0.65,
      ipoDate: new Date('1999-01-22'),
      country: 'USA',
      currency: 'USD',
      avatar: 'https://financialmodelingprep.com/image-stock/NVDA.png',
    },
    {
      ticker: 'META',
      companyName: 'Meta Platforms, Inc.',
      exchange: 'NASDAQ',
      sector: 'Communication Services',
      industry: 'Internet Content & Information',
      marketCap: BigInt(900_000_000_000),
      outstandingShares: BigInt(2_600_000_000),
      insiderHolding: 0.13,
      institutionalHolding: 0.7,
      ipoDate: new Date('2012-05-18'),
      country: 'USA',
      currency: 'USD',
      avatar: 'https://financialmodelingprep.com/image-stock/META.png',
    },
  ];

  for (const stockData of stocks) {
    await prisma.stock.upsert({
      where: { ticker: stockData.ticker },
      update: {},
      create: stockData,
    });
    console.log(`✅ Created stock: ${stockData.ticker}`);
  }

  // 2. Seed existing demo user
  const plainPassword = 'password123';
  const hash = await bcrypt.hash(plainPassword, 8);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: hash,
      avatar: 'https://i.pravatar.cc/200?u=18284',
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

  // 2.1. Seed admin user
  const adminPassword = 'admin123';
  const adminHash = await bcrypt.hash(adminPassword, 8);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      avatar: 'https://i.pravatar.cc/200?u=admin',
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email} / ${adminPassword}`);
  await prisma.balance.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      amount: 500000, // 500k USD for admin user
    },
  });
  console.log(`✅ Seeded balance for ${adminUser.email}`);

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
      avatar: 'https://i.pravatar.cc/200?u=1234567890123456789012345678',
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

  // Give buyer@example.com some AAPL shares to sell
  await prisma.portfolio.upsert({
    where: {
      userId_ticker: {
        userId: buyer.id,
        ticker: 'AAPL',
      },
    },
    update: {
      quantity: 50,
      averagePrice: 280,
    },
    create: {
      userId: buyer.id,
      ticker: 'AAPL',
      quantity: 50,
      averagePrice: 280,
      positionType: 'LONG',
    },
  });
  console.log(`✅ Seeded AAPL portfolio for ${buyer.email}`);

  // --- Create Sellers ---
  const sellersData = [
    {
      email: 'seller1@example.com',
      shares: 50,
      avatarId: '9876543210987654321098765432',
    },
    {
      email: 'seller2@example.com',
      shares: 50,
      avatarId: '5555555555555555555555555555',
    },
    {
      email: 'seller3@example.com',
      shares: 50,
      avatarId: '7777777777777777777777777777',
    },
  ];

  for (const sellerData of sellersData) {
    const seller = await prisma.user.upsert({
      where: { email: sellerData.email },
      update: {},
      create: {
        email: sellerData.email,
        passwordHash,
        avatar: `https://i.pravatar.cc/200?u=${sellerData.avatarId}`,
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

  // --- Create Buyers for test-sell-limit-multiple-buy ---
  const buyersData = [
    {
      email: 'buyer1@example.com',
      balance: 100000,
      avatarId: '1111111111111111111111111111',
    },
    {
      email: 'buyer2@example.com',
      balance: 100000,
      avatarId: '2222222222222222222222222222',
    },
    {
      email: 'buyer3@example.com',
      balance: 100000,
      avatarId: '3333333333333333333333333333',
    },
  ];

  for (const buyerData of buyersData) {
    const buyer = await prisma.user.upsert({
      where: { email: buyerData.email },
      update: {},
      create: {
        email: buyerData.email,
        passwordHash,
        avatar: `https://i.pravatar.cc/200?u=${buyerData.avatarId}`,
      },
    });
    console.log(`✅ Created buyer user: ${buyer.email} / ${simplePassword}`);

    await prisma.balance.upsert({
      where: { userId: buyer.id },
      update: { amount: buyerData.balance },
      create: {
        userId: buyer.id,
        amount: buyerData.balance,
      },
    });
    console.log(`✅ Seeded balance for ${buyer.email}`);
  }

  // --- Create single Seller for test-sell-limit-multiple-buy ---
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      passwordHash,
      avatar: 'https://i.pravatar.cc/200?u=8888888888888888888888888888',
    },
  });
  console.log(
    `✅ Created seller user: ${sellerUser.email} / ${simplePassword}`,
  );

  await prisma.balance.upsert({
    where: { userId: sellerUser.id },
    update: { amount: 20000 },
    create: {
      userId: sellerUser.id,
      amount: 20000,
    },
  });
  console.log(`✅ Seeded balance for ${sellerUser.email}`);

  await prisma.portfolio.upsert({
    where: {
      userId_ticker: {
        userId: sellerUser.id,
        ticker,
      },
    },
    update: {
      quantity: 50,
      averagePrice: 180,
    },
    create: {
      userId: sellerUser.id,
      ticker,
      quantity: 50,
      averagePrice: 180,
      positionType: 'LONG',
    },
  });
  console.log(`✅ Seeded portfolio for ${sellerUser.email}`);

  // 4. Seed MarketData for all stocks
  const marketDataConfig = [
    { ticker: 'AAPL', basePrice: 150, volume: 1_000_000 },
    { ticker: 'GOOG', basePrice: 2800, volume: 500_000 },
    { ticker: 'MSFT', basePrice: 380, volume: 800_000 },
    { ticker: 'TSLA', basePrice: 250, volume: 1_500_000 },
    { ticker: 'AMZN', basePrice: 140, volume: 600_000 },
    { ticker: 'NVDA', basePrice: 900, volume: 2_000_000 },
    { ticker: 'META', basePrice: 350, volume: 700_000 },
  ];

  for (const config of marketDataConfig) {
    for (let i = 0; i < 10; i++) {
      const variation = Math.random() * 20 - 10; // Random variation between -10 and +10
      const basePrice = config.basePrice + variation;

      await prisma.marketData.create({
        data: {
          ticker: config.ticker,
          timestamp: new Date(now.getTime() - i * 86400000),
          interval: '1d',
          open: basePrice + (Math.random() * 4 - 2),
          high: basePrice + Math.random() * 8,
          low: basePrice - Math.random() * 8,
          close: basePrice + (Math.random() * 4 - 2),
          volume: BigInt(config.volume + Math.floor(Math.random() * 100000)),
          afterHours: basePrice + (Math.random() * 2 - 1),
        },
      });
    }
    console.log(`✅ Created market data for ${config.ticker}`);
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
    '✅ Seeded Users (demo, buyer, buyer1, buyer2, buyer3, seller, seller1, seller2, seller3), Transactions, Portfolios',
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
