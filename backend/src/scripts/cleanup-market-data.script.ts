import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupMarketData() {
  console.log('🧹 Cleaning up market data with duplicate timestamps...');

  try {
    // Delete all existing market data
    const deletedCount = await prisma.marketData.deleteMany({});
    console.log(
      `✅ Deleted ${deletedCount.count} existing market data records`,
    );

    // Delete all existing transactions
    const deletedTransactions = await prisma.transaction.deleteMany({});
    console.log(
      `✅ Deleted ${deletedTransactions.count} existing transactions`,
    );

    // Delete all existing orders
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`✅ Deleted ${deletedOrders.count} existing orders`);

    console.log('🎯 Market data cleanup completed!');
    console.log(
      '💡 Now run the dashboard seeder to generate new data with proper timestamps.',
    );
  } catch (error) {
    console.error('❌ Error cleaning up market data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupMarketData();
