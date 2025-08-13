/* eslint-disable */
// scripts/test-socket-connection.script.ts

import { login, createClient, prisma } from './test-utils';
import { io, Socket } from 'socket.io-client';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function printSection(title: string) {
  console.log(`\n==== ${title} ====`);
}

async function loginSmart(email: string, passwords: string[]): Promise<string> {
  let lastError: any;
  for (const pwd of passwords) {
    try {
      return await login(email, pwd);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error(`Unable to login for ${email}`);
}

async function main() {
  await printSection('SOCKET CONNECTION TEST');

  // Login to get tokens
  console.log('🔐 Logging in users...');
  const demoToken = await loginSmart('demo@example.com', [
    'password123',
    '123456',
  ]);

  console.log('✅ Demo token:', demoToken.substring(0, 50) + '...');

  await printSection('WEBSOCKET CONNECTION');

  // Connect to WebSocket with authentication
  const demoSocket = io('http://127.0.0.1:4000', {
    auth: { token: demoToken },
    transports: ['websocket'],
  });

  // Set up event listeners
  demoSocket.on('connect', () => {
    console.log('✅ Demo user connected to WebSocket:', demoSocket.id);
  });

  demoSocket.on('connectionTest', (data) => {
    console.log('📡 Demo connection test:', data);
  });

  demoSocket.on('orderNotification', (data) => {
    console.log('🔔 Demo received order notification:', data);
  });

  demoSocket.on('balanceUpdate', (data) => {
    console.log('💰 Demo received balance update:', data);
  });

  demoSocket.on('portfolioUpdate', (data) => {
    console.log('📊 Demo received portfolio update:', data);
  });

  demoSocket.on('priceAlert', (data) => {
    console.log('🚨 Demo received price alert:', data);
  });

  demoSocket.on('marketDataUpdate', (data) => {
    console.log('📈 Demo received market data update:', data);
  });

  // Wait for connection
  await new Promise<void>((resolve) => {
    demoSocket.on('connect', resolve);
  });

  await delay(1000);

  await printSection('TESTING EVENTS');

  // Test order notification
  console.log('🧪 Testing order notification...');
  demoSocket.emit('testNotification', {
    userId: 'demo@example.com',
    type: 'orderNotification',
  });

  await delay(1000);

  // Test balance update
  console.log('🧪 Testing balance update...');
  demoSocket.emit('testNotification', {
    userId: 'demo@example.com',
    type: 'balanceUpdate',
  });

  await delay(1000);

  // Test portfolio update
  console.log('🧪 Testing portfolio update...');
  demoSocket.emit('testNotification', {
    userId: 'demo@example.com',
    type: 'portfolioUpdate',
  });

  await delay(1000);

  // Test price alert
  console.log('🧪 Testing price alert...');
  demoSocket.emit('testNotification', {
    userId: 'demo@example.com',
    type: 'priceAlert',
  });

  await delay(1000);

  // Test market data broadcast
  console.log('🧪 Testing market data broadcast...');
  demoSocket.emit('mockMarketData', {
    ticker: 'AAPL',
    price: 185,
  });

  await delay(2000);

  await printSection('SUMMARY');

  console.log('🎯 Socket connection test completed!');
  console.log('\n📡 To test in POSTMAN:');
  console.log('1. Connect to WebSocket: ws://127.0.0.1:4000');
  console.log('2. Send auth token in auth object: { "token": "your-jwt-token" }');
  console.log('3. Listen for events: orderNotification, balanceUpdate, portfolioUpdate, priceAlert, marketDataUpdate');
  console.log('4. Send test events using:');
  console.log('   - testNotification: { "userId": "demo@example.com", "type": "orderNotification" }');
  console.log('   - mockMarketData: { "ticker": "AAPL", "price": 185 }');

  // Clean up
  demoSocket.disconnect();
}

main()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
