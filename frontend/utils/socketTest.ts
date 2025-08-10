import { socketService } from '../services/socketService';

export async function testSocketConnection() {
  console.log('🧪 Testing Frontend Socket Connection...');
  
  try {
    // Connect to socket
    const socket = await socketService.connect();
    console.log('✅ Socket connected successfully:', socket.id);
    
    // Test ping
    console.log('🏓 Testing ping...');
    socketService.pingServer();
    
    // Test mock market data
    console.log('📊 Testing mock market data...');
    socketService.sendMockMarketData('AAPL', 150.50);
    
    // Test portfolio update request
    console.log('📊 Testing portfolio update request...');
    socketService.requestPortfolioUpdate('test-user-id');
    
    // Wait for responses
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Frontend socket test completed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Frontend socket test failed:', error);
    return false;
  }
}

export function disconnectSocket() {
  socketService.disconnect();
  console.log('🔌 Socket disconnected');
}
