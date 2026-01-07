# Dashboard Analytics APIs - GraphQL Query Examples

This document provides example GraphQL queries for the four new dashboard analytics endpoints.

## 1. Get Holdings with P&L

Returns user's portfolio holdings with profit/loss calculations and pagination.

```graphql
query GetHoldings {
  getHoldings(input: { page: 1, limit: 10 }) {
    data {
      symbol
      quantity
      avgPrice
      currentPrice
      pnl
      pnlPercent
      side
    }
    total
    page
    totalPages
  }
}
```

**Response Example:**
```json
{
  "data": {
    "getHoldings": {
      "data": [
        {
          "symbol": "AAPL",
          "quantity": 10,
          "avgPrice": 150,
          "currentPrice": 165.5,
          "pnl": 155,
          "pnlPercent": 10.33,
          "side": "profit"
        }
      ],
      "total": 5,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

## 2. Get Recent Activities

Returns user's transaction history with current price comparison.

```graphql
query GetRecentActivities {
  getRecentActivities(input: { page: 1, limit: 20 }) {
    data {
      type
      timestamp
      ticker
      shares
      avgPrice
      currentPrice
    }
    total
    page
    totalPages
  }
}
```

**Response Example:**
```json
{
  "data": {
    "getRecentActivities": {
      "data": [
        {
          "type": "BUY",
          "timestamp": "2026-01-07T10:30:00Z",
          "ticker": "AAPL",
          "shares": 10,
          "avgPrice": 150,
          "currentPrice": 165.5
        },
        {
          "type": "SELL",
          "timestamp": "2026-01-06T14:20:00Z",
          "ticker": "GOOGL",
          "shares": 5,
          "avgPrice": 2800,
          "currentPrice": 2850
        }
      ],
      "total": 25,
      "page": 1,
      "totalPages": 2
    }
  }
}
```

## 3. Get Market Overview

Returns market indices with trend indicators.

```graphql
query GetMarketOverview {
  getMarketOverview(input: { page: 1, limit: 10 }) {
    data {
      key
      label
      value
      unit
      trend
    }
    total
    page
    totalPages
  }
}
```

**Response Example:**
```json
{
  "data": {
    "getMarketOverview": {
      "data": [
        {
          "key": "sp500",
          "label": "S&P 500",
          "value": 1.2,
          "unit": "%",
          "trend": "up"
        },
        {
          "key": "nasdaq",
          "label": "NASDAQ",
          "value": -0.8,
          "unit": "%",
          "trend": "down"
        },
        {
          "key": "dow",
          "label": "DOW",
          "value": 0.5,
          "unit": "%",
          "trend": "up"
        },
        {
          "key": "vix",
          "label": "VIX",
          "value": 18.5,
          "unit": "",
          "trend": "neutral"
        }
      ],
      "total": 6,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

## 4. Get Top Movers

Returns top gaining or losing stocks with percentage changes.

### Top Gainers
```graphql
query GetTopGainers {
  getTopMovers(input: { page: 1, limit: 10, filter: "gainers" }) {
    data {
      symbol
      avatar
      value
    }
    total
    page
    totalPages
  }
}
```

### Top Losers
```graphql
query GetTopLosers {
  getTopMovers(input: { page: 1, limit: 10, filter: "losers" }) {
    data {
      symbol
      avatar
      value
    }
    total
    page
    totalPages
  }
}
```

**Response Example:**
```json
{
  "data": {
    "getTopMovers": {
      "data": [
        {
          "symbol": "TSLA",
          "avatar": "https://example.com/avatars/tsla.png",
          "value": 8.5
        },
        {
          "symbol": "AAPL",
          "avatar": "https://example.com/avatars/aapl.png",
          "value": 5.2
        },
        {
          "symbol": "NVDA",
          "avatar": "https://example.com/avatars/nvda.png",
          "value": 4.8
        }
      ],
      "total": 150,
      "page": 1,
      "totalPages": 15
    }
  }
}
```

## Notes

### Authentication
All queries require authentication via the `GqlAuthGuard`. Include your JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Pagination
All endpoints support pagination with:
- `page`: Page number (starts at 1, default: 1)
- `limit`: Items per page (min: 1, max: 100, default: 20)

### Market Overview Data
The market overview currently returns mock data. Integration with a real-time market data provider (e.g., Alpha Vantage, Yahoo Finance API) should be added in the future.

### Top Movers Calculation
Top movers are calculated based on percentage change between the two most recent market data points for each stock. Stocks with insufficient data are excluded.

### Performance Considerations
- Holdings and Activities queries fetch current prices asynchronously for each item
- Top Movers calculates percentage change for all tradable stocks
- Consider adding caching for market overview data to reduce load
- Monitor query performance with large datasets and add indexes if needed
