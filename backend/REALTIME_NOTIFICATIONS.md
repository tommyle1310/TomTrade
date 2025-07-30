# Real-time Notifications & P&L System

## Overview

This document describes the implementation of real-time notifications and P&L calculation system in TomTrade.

## 🎯 Features Implemented

### 1. Real-time Order Notifications

- **Order Filled**: When an order is completely filled
- **Order Partial**: When an order is partially filled
- **Order Cancelled**: When an order is cancelled

### 2. Real-time Portfolio Updates

- **Portfolio Value**: Total market value of all positions
- **P&L Updates**: Real-time profit/loss calculations
- **Position Updates**: Individual position P&L and market value

### 3. Real-time Balance Updates

- **Account Balance**: Current cash balance
- **Total Assets**: Portfolio value + cash balance

### 4. Price Alerts

- **Alert Triggers**: When stock prices cross threshold values
- **Real-time Delivery**: Instant WebSocket notifications

## 🔧 Implementation Details

### WebSocket Events

#### Order Notifications

```typescript
socket.on('orderNotification', (notification) => {
  // notification: {
  //   type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED'
  //   orderId: string
  //   ticker: string
  //   side: 'BUY' | 'SELL'
  //   quantity: number
  //   price: number
  //   message: string
  // }
});
```

#### Portfolio Updates

```typescript
socket.on('portfolioUpdate', (portfolioData) => {
  // portfolioData: {
  //   totalValue: number
  //   totalPnL: number
  //   positions: Array<{
  //     ticker: string
  //     quantity: number
  //     averagePrice: number
  //     currentPrice: number
  //     marketValue: number
  //     unrealizedPnL: number
  //     pnlPercentage: number
  //   }>
  // }
});
```

#### Balance Updates

```typescript
socket.on('balanceUpdate', (balanceData) => {
  // balanceData: {
  //   balance: number
  //   totalAssets: number
  // }
});
```

#### Price Alerts

```typescript
socket.on('priceAlert', (alert) => {
  // alert: {
  //   message: string
  //   alert: AlertSent
  // }
});
```

### P&L Calculation

#### Unrealized P&L

```
Unrealized P&L = (Current Price - Average Buy Price) × Quantity
```

#### Realized P&L

```
Realized P&L = Sum of (Sell Price - Buy Price) for completed trades
```

#### Total P&L

```
Total P&L = Unrealized P&L + Realized P&L
```

#### Portfolio Value

```
Portfolio Value = Sum of (Current Price × Quantity) for all positions
```

#### Total Assets

```
Total Assets = Portfolio Value + Cash Balance
```

## 🚀 API Endpoints

### Portfolio Summary

```graphql
query {
  getPortfolioSummary
}
```

### Position P&L

```graphql
query {
  getPositionPnL(ticker: "AAPL")
}
```

### Total P&L

```graphql
query {
  getTotalPnL
}
```

## 📊 Data Structure

### Portfolio Summary Response

```json
{
  "totalValue": 15000,
  "totalPnL": 2500,
  "totalUnrealizedPnL": 2000,
  "totalRealizedPnL": 500,
  "totalAssets": 25000,
  "balance": 10000,
  "positions": [
    {
      "ticker": "AAPL",
      "quantity": 50,
      "averagePrice": 280,
      "currentPrice": 300,
      "marketValue": 15000,
      "unrealizedPnL": 1000,
      "pnlPercentage": 7.14
    }
  ],
  "pnlPercentage": 16.67
}
```

### Position P&L Response

```json
{
  "ticker": "AAPL",
  "quantity": 50,
  "averagePrice": 280,
  "currentPrice": 300,
  "marketValue": 15000,
  "unrealizedPnL": 1000,
  "pnlPercentage": 7.14
}
```

## 🧪 Testing

### Test Real-time Notifications

```bash
npx ts-node src/scripts/test-realtime-notifications.script.ts
```

### Test P&L Calculations

```bash
# Query portfolio summary
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"query { getPortfolioSummary }"}'
```

## 🔄 Real-time Flow

1. **Market Data Update**: Stock price changes
2. **Order Matching**: Try to match existing orders
3. **Trade Execution**: Execute matched trades
4. **Notifications**: Send order notifications to users
5. **Portfolio Updates**: Calculate and send P&L updates
6. **Alert Checks**: Check and trigger price alerts
7. **Balance Updates**: Send updated balance information

## 📈 Performance Considerations

- **Efficient P&L Calculation**: Cached calculations for better performance
- **Selective Updates**: Only send updates to users with relevant positions
- **Batch Processing**: Group multiple updates when possible
- **Connection Management**: Proper WebSocket connection handling

## 🎯 Next Steps

1. **Market Data Integration**: Connect to real market data feeds
2. **Advanced P&L**: Add more sophisticated P&L calculations
3. **Performance Optimization**: Implement caching and optimization
4. **Mobile Notifications**: Add push notifications for mobile apps
5. **Historical P&L**: Add historical P&L tracking and charts
