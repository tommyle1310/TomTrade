import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StockService } from '../stock/stock.service';

async function testSocketConnection() {
  console.log('🧪 Testing Socket Connection...');
  
  const app = await NestFactory.create(AppModule);
  
  try {
    const stockService = app.get(StockService);
    
    console.log('✅ StockService retrieved successfully');
    
    // Test market data update
    console.log('📊 Testing market data update...');
    await stockService.processMarketDataUpdate({
      ticker: 'AAPL',
      price: 150.50,
      volume: 1000,
    });
    
    console.log('✅ Market data update processed successfully');
    
    // Wait a bit for socket events to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Socket connection test completed successfully');
  } catch (error) {
    console.error('❌ Socket connection test failed:', error);
  } finally {
    await app.close();
  }
}

// Run the test
testSocketConnection().catch(console.error);
