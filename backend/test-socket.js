const { io } = require('socket.io-client');

console.log('🧪 Testing Socket.IO connection...');

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  timeout: 5000,
});

socket.on('connect', () => {
  console.log('✅ Connected to server with ID:', socket.id);

  // Test the connection
  socket.emit('test', { message: 'Hello from test script!' });

  // Test ping
  socket.emit('ping');
});

socket.on('testResponse', (data) => {
  console.log('✅ Test response received:', data);
});

socket.on('pong', (data) => {
  console.log('🏓 Pong received:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
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
