// scripts/mock-data.script.ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  query: {
    isMockClient: 'true',
  },
});

socket.on('connect', () => {
  console.log('✅ Connected as mock client');
  
  const payload = { ticker: 'AAPL', price: 300 };
  socket.emit('mockMarketData', payload, (response) => {
    console.log('✅ Server responded:', response);
  });
});
