# WebSocket Testing Guide

## 🎯 Current Status: ✅ WORKING

All WebSocket events are working correctly! The socket connection test shows:

- ✅ Connection successful
- ✅ Order notifications received
- ✅ Balance updates received
- ✅ Portfolio updates received
- ✅ Price alerts received
- ✅ Market data broadcasts received

## 📡 Testing in POSTMAN

### 1. Connect to WebSocket

**URL**: `ws://127.0.0.1:4000`

### 2. Authentication

In the **Headers** or **Auth** section, add:

```json
{
  "auth": {
    "token": "your-jwt-token-here"
  }
}
```

**To get a JWT token:**

1. Use the GraphQL endpoint: `http://localhost:3000/graphql`
2. Run this mutation:

```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
  }
}
```

3. Use the returned token in your WebSocket connection

### 3. Listen for Events

After connecting, you should automatically receive a `connectionTest` event. Then listen for these events:

- `orderNotification` - Order filled, partial, or cancelled
- `balanceUpdate` - Real-time balance changes
- `portfolioUpdate` - Portfolio value and P&L updates
- `priceAlert` - Price alert notifications
- `marketDataUpdate` - Market data broadcasts

### 4. Test Events

Send these test events to trigger notifications:

**Test Order Notification:**

```json
{
  "event": "testNotification",
  "data": {
    "userId": "demo@example.com",
    "type": "orderNotification"
  }
}
```

**Test Balance Update:**

```json
{
  "event": "testNotification",
  "data": {
    "userId": "demo@example.com",
    "type": "balanceUpdate"
  }
}
```

**Test Portfolio Update:**

```json
{
  "event": "testNotification",
  "data": {
    "userId": "demo@example.com",
    "type": "portfolioUpdate"
  }
}
```

**Test Price Alert:**

```json
{
  "event": "testNotification",
  "data": {
    "userId": "demo@example.com",
    "type": "priceAlert"
  }
}
```

**Test Market Data Broadcast:**

```json
{
  "event": "mockMarketData",
  "data": {
    "ticker": "AAPL",
    "price": 185
  }
}
```

## 🚀 Testing in Frontend Apps

### React Native / Expo

```typescript
import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:4000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket'],
});

// Listen for events
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('orderNotification', (data) => {
  console.log('Order notification:', data);
});

socket.on('balanceUpdate', (data) => {
  console.log('Balance update:', data);
});

socket.on('portfolioUpdate', (data) => {
  console.log('Portfolio update:', data);
});

socket.on('priceAlert', (data) => {
  console.log('Price alert:', data);
});

socket.on('marketDataUpdate', (data) => {
  console.log('Market data update:', data);
});
```

### Web Frontend

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket'],
});

// Listen for events
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('orderNotification', (data) => {
  console.log('Order notification:', data);
});

socket.on('balanceUpdate', (data) => {
  console.log('Balance update:', data);
});

socket.on('portfolioUpdate', (data) => {
  console.log('Portfolio update:', data);
});

socket.on('priceAlert', (data) => {
  console.log('Price alert:', data);
});

socket.on('marketDataUpdate', (data) => {
  console.log('Market data update:', data);
});
```

## 🧪 Running Tests

### Socket Connection Test

```bash
npm run test:socket-connection
```

### Real-time Events Test

```bash
npm run test:realtime-events
```

### Comprehensive Trading Test

```bash
npm run test:demo-buyer2-comprehensive
```

## 🔧 Troubleshooting

### If events are not received:

1. **Check Authentication**: Ensure the JWT token is valid and properly sent
2. **Check Connection**: Verify the WebSocket connection is established
3. **Check Room Joining**: Users should automatically join their rooms on connection
4. **Check Event Names**: Ensure you're listening for the correct event names
5. **Check Server Logs**: Look for any errors in the server console

### Common Issues:

1. **CORS Issues**: Make sure the frontend origin is allowed in the WebSocket gateway
2. **Token Issues**: Ensure the JWT token is not expired
3. **Network Issues**: Check if the WebSocket server is running on the correct port
4. **Event Timing**: Some events are sent with delays to prevent duplicates

## 📊 Event Types

### Order Notifications

```typescript
{
  type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED',
  orderId: string,
  ticker: string,
  side: 'BUY' | 'SELL',
  quantity: number,
  price: number,
  message: string
}
```

### Balance Updates

```typescript
{
  balance: number,
  totalAssets: number
}
```

### Portfolio Updates

```typescript
{
  totalValue: number,
  totalPnL: number,
  positions: Array<{
    ticker: string,
    quantity: number,
    averagePrice: number,
    currentPrice: number,
    marketValue: number,
    unrealizedPnL: number,
    pnlPercentage: number
  }>
}
```

### Price Alerts

```typescript
{
  message: string,
  alert: {
    id: string
  }
}
```

### Market Data Updates

```typescript
{
  ticker: string,
  price: number,
  volume: number,
  timestamp: string
}
```

## ✅ Success Criteria

Your WebSocket implementation is working correctly when:

1. ✅ Clients can connect with valid JWT tokens
2. ✅ Clients automatically join their user rooms
3. ✅ Order notifications are received after trades
4. ✅ Balance updates are received after trades
5. ✅ Portfolio updates are received after trades
6. ✅ Price alerts are received when triggered
7. ✅ Market data broadcasts are received by all clients

All of these are currently working! 🎉
