const { io } = require('socket.io-client');

console.log('🧪 Testing TestGateway Socket.IO connection...');

const socket = io('http://localhost:3000/test', {
  transports: ['websocket'],
  timeout: 5000,
  forceNew: true,
});

socket.on('connect', () => {
  console.log('✅ Connected to TestGateway with ID:', socket.id);

  // Test ping
  socket.emit('ping');
});

socket.on('connectionTest', (data) => {
  console.log('✅ Connection test received:', data);
});

socket.on('pong', (data) => {
  console.log('🏓 Pong received:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('❌ Full error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

// Cleanup after 5 seconds
setTimeout(() => {
  console.log('🧹 Cleaning up...');
  socket.disconnect();
  process.exit(0);
}, 5000);
