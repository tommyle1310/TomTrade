import { PrismaService } from 'prisma/prisma.service';
import { OrderService } from '../order/order.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionService } from '../transaction/transaction.service';
import { StockService } from '../stock/stock.service';
import { BalanceService } from '../balance/balance.service';
import { IndicatorService } from '../stock/indicator.service';
import { RiskService } from '../risk/risk.service';
import { AdminService } from '../admin/admin.service';
import { PriceFeedListenerService } from '../order/price-feed-listener.service';

async function testNewFeatures() {
  const prisma = new PrismaService();

  try {
    console.log(
      '🧪 Testing New Features: STOP Orders, Indicators, Risk Management, Admin Panel\n',
    );

    // Clean up any existing test data
    const existingAdminUser = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
    });
    if (existingAdminUser) {
      await prisma.balance.deleteMany({
        where: { userId: existingAdminUser.id },
      });
      await prisma.portfolio.deleteMany({
        where: { userId: existingAdminUser.id },
      });
      await prisma.transaction.deleteMany({
        where: { userId: existingAdminUser.id },
      });
      await prisma.order.deleteMany({
        where: { userId: existingAdminUser.id },
      });
      await prisma.user.delete({ where: { id: existingAdminUser.id } });
    }

    const existingRegularUser = await prisma.user.findUnique({
      where: { email: 'user@test.com' },
    });
    if (existingRegularUser) {
      await prisma.balance.deleteMany({
        where: { userId: existingRegularUser.id },
      });
      await prisma.portfolio.deleteMany({
        where: { userId: existingRegularUser.id },
      });
      await prisma.transaction.deleteMany({
        where: { userId: existingRegularUser.id },
      });
      await prisma.order.deleteMany({
        where: { userId: existingRegularUser.id },
      });
      await prisma.user.delete({ where: { id: existingRegularUser.id } });
    }

    // Create test users (without role field until migration is run)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: 'admin-hash',
      },
    });

    const regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        passwordHash: 'user-hash',
      },
    });

    console.log('✅ Created test users');

    // Create test stock (use upsert to handle existing data)
    const stock = await prisma.stock.upsert({
      where: { ticker: 'TEST' },
      update: {},
      create: {
        ticker: 'TEST',
        companyName: 'Test Company',
        exchange: 'NASDAQ',
        sector: 'Technology',
      },
    });

    console.log('✅ Created test stock');

    // Create balance for regular user
    await prisma.balance.upsert({
      where: { userId: regularUser.id },
      update: { amount: 10000 },
      create: {
        userId: regularUser.id,
        amount: 10000,
      },
    });

    console.log('✅ Created balance for user');

    // Clean up existing market data for TEST ticker
    await prisma.marketData.deleteMany({ where: { ticker: 'TEST' } });

    // Create market data for technical indicators
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      await prisma.marketData.create({
        data: {
          ticker: 'TEST',
          timestamp: date,
          interval: '1d',
          open: 100 + Math.random() * 20,
          high: 110 + Math.random() * 20,
          low: 90 + Math.random() * 20,
          close: 100 + Math.random() * 20,
          volume: BigInt(Math.floor(1000 + Math.random() * 5000)),
        },
      });
    }

    console.log('✅ Created market data for indicators');

    // Test 1: Technical Indicators
    console.log('\n📊 Test 1: Technical Indicators');
    const indicatorService = new IndicatorService(prisma);

    try {
      const sma = await indicatorService.getSMA('TEST', 20, '1d');
      console.log('✅ SMA (20):', sma[sma.length - 1].toFixed(2));

      const ema = await indicatorService.getEMA('TEST', 20, '1d');
      console.log('✅ EMA (20):', ema[ema.length - 1].toFixed(2));

      const rsi = await indicatorService.getRSI('TEST', 14, '1d');
      console.log('✅ RSI (14):', rsi[rsi.length - 1].toFixed(2));

      const bands = await indicatorService.getBollingerBands(
        'TEST',
        20,
        2,
        '1d',
      );
      console.log(
        '✅ Bollinger Bands - Upper:',
        bands.upper[bands.upper.length - 1].toFixed(2),
      );

      const macd = await indicatorService.getMACD('TEST', 12, 26, 9, '1d');
      console.log('✅ MACD:', macd.macd[macd.macd.length - 1].toFixed(2));
    } catch (error) {
      console.log('❌ Technical indicators test failed:', error.message);
    }

    // Test 2: Risk Management
    console.log('\n🛡️ Test 2: Risk Management');
    const riskService = new RiskService(prisma);

    try {
      const riskReport = await riskService.getRiskReport(regularUser.id);
      console.log('✅ Risk Report:', {
        portfolioValue: riskReport.portfolioValue.toFixed(2),
        portfolioRisk: riskReport.portfolioRisk.toFixed(2),
        maxPositionSize: riskReport.maxPositionSize.toFixed(2),
      });

      const positionValidation = await riskService.validatePositionSize(
        regularUser.id,
        'TEST',
        100,
        50,
      );
      console.log('✅ Position Size Validation:', positionValidation.isValid);

      const maxPosition = await riskService.calculateMaxPositionSize(
        regularUser.id,
        'TEST',
        50,
      );
      console.log('✅ Max Position Size:', maxPosition.maxQuantity, 'shares');
    } catch (error) {
      console.log('❌ Risk management test failed:', error.message);
    }

    // Test 3: STOP Orders
    console.log('\n🛑 Test 3: STOP Orders');

    try {
      // Create portfolio position first
      await prisma.portfolio.upsert({
        where: {
          userId_ticker: {
            userId: regularUser.id,
            ticker: 'TEST',
          },
        },
        update: {
          quantity: 100,
          averagePrice: 50,
        },
        create: {
          userId: regularUser.id,
          ticker: 'TEST',
          quantity: 100,
          averagePrice: 50,
          positionType: 'LONG',
        },
      });

      // Place a STOP SELL order
      const stopOrder = await prisma.order.create({
        data: {
          userId: regularUser.id,
          ticker: 'TEST',
          side: 'SELL',
          price: 45, // Limit price
          quantity: 50,
          type: 'STOP_LIMIT',
          timeInForce: 'GTC',
          triggerPrice: 48, // Trigger when price falls to 48
        },
      });

      console.log('✅ Created STOP order:', stopOrder.id);

      // Test price feed listener
      const priceFeedListener = new PriceFeedListenerService(
        prisma,
        null as any, // OrderService mock
        null as any, // EventEmitter mock
      );

      // Simulate price update that should trigger the STOP order
      await priceFeedListener.handlePriceUpdate('TEST', 47); // Price below trigger

      // Check if STOP order was triggered
      const updatedOrder = await prisma.order.findUnique({
        where: { id: stopOrder.id },
      });

      console.log('✅ STOP order status:', updatedOrder?.status);
    } catch (error) {
      console.log('❌ STOP orders test failed:', error.message);
    }

    // Test 4: Admin Panel
    console.log('\n👑 Test 4: Admin Panel');
    const adminService = new AdminService(prisma);

    try {
      const allUsers = await adminService.getAllUsers();
      console.log('✅ All users count:', allUsers.length);

      const systemStats = await adminService.getSystemStats();
      console.log('✅ System stats:', systemStats);

      const userPortfolio = await adminService.getUserPortfolio(regularUser.id);
      console.log('✅ User portfolio view:', {
        user: userPortfolio.user.email,
        portfolioItems: userPortfolio.portfolio.length,
        balance: userPortfolio.balance,
      });

      // Test ban/unban functionality
      await adminService.banUser(regularUser.id);
      console.log('✅ User banned');

      const bannedUser = await adminService.getUserById(regularUser.id);
      console.log('✅ Banned user status:', (bannedUser as any).isBanned);

      await adminService.unbanUser(regularUser.id);
      console.log('✅ User unbanned');

      // Test admin promotion
      await adminService.promoteToAdmin(regularUser.id);
      console.log('✅ User promoted to admin');

      const promotedUser = await adminService.getUserById(regularUser.id);
      console.log('✅ User role:', (promotedUser as any).role);

      await adminService.demoteFromAdmin(regularUser.id);
      console.log('✅ User demoted from admin');
    } catch (error) {
      console.log('❌ Admin panel test failed:', error.message);
    }

    console.log('\n🎉 All new features tests completed!');
  } catch (error) {
    console.error('❌ New features test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testNewFeatures();
