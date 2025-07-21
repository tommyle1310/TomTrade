import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ticker = 'AAPL';

  // Seed Stock nếu chưa có
  await prisma.stock.upsert({
    where: { ticker },
    update: {},
    create: {
      ticker,
      companyName: 'Apple Inc.',
      exchange: 'NASDAQ',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      marketCap: BigInt(3000000000000),
      outstandingShares: BigInt(16000000000),
      insiderHolding: 0.02,
      institutionalHolding: 0.58,
      ipoDate: new Date('1980-12-12'),
      country: 'USA',
      currency: 'USD',
    },
  });

  // Seed MarketData
  const now = new Date();
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
        volume: BigInt(1000000 + i * 10000),
        afterHours: 151 + i,
      },
    });
  }

  // Seed News
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

  // Seed Dividends
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

  // Seed Forecast Models
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

  console.log('✅ Seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
