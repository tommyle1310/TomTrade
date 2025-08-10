const { io } = require('socket.io-client');

console.log('🧪 Testing Socket.IO connection WITHOUT authentication...');

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  timeout: 5000,
  forceNew: true,
});

socket.on('connect', () => {
  console.log('✅ Connected to server with ID:', socket.id);

  // Test the connection
  socket.emit('test', { message: 'Hello from test script (no auth)!' });

  // Test ping
  socket.emit('ping');
});

socket.on('connectionTest', (data) => {
  console.log('✅ Connection test received:', data);
});

socket.on('testResponse', (data) => {
  console.log('✅ Test response received:', data);
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
