# Dashboard API GraphQL Examples

## Get Full Dashboard

```graphql
query GetDashboard {
  getDashboard {
    totalPortfolioValue
    totalRealizedPnL
    totalUnrealizedPnL
    totalPnL
    cashBalance
    stockPositions {
      ticker
      companyName
      quantity
      averageBuyPrice
      currentPrice
      marketValue
      unrealizedPnL
      unrealizedPnLPercent
    }
  }
}
```

## Get Individual Stock Position

```graphql
query GetStockPosition($ticker: String!) {
  getStockPosition(ticker: $ticker) {
    ticker
    companyName
    quantity
    averageBuyPrice
    currentPrice
    marketValue
    unrealizedPnL
    unrealizedPnLPercent
  }
}
```

## Variables for Stock Position Query

```json
{
  "ticker": "AAPL"
}
```

## Response Example

```json
{
  "data": {
    "getDashboard": {
      "totalPortfolioValue": 15200.0,
      "totalRealizedPnL": 200.0,
      "totalUnrealizedPnL": 700.0,
      "totalPnL": 900.0,
      "cashBalance": 5000.0,
      "stockPositions": [
        {
          "ticker": "AAPL",
          "companyName": "Apple Inc.",
          "quantity": 100,
          "averageBuyPrice": 145.0,
          "currentPrice": 152.0,
          "marketValue": 15200.0,
          "unrealizedPnL": 700.0,
          "unrealizedPnLPercent": 4.83
        }
      ]
    }
  }
}
```

## Authentication

All dashboard queries require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Calculations Explained

1. **Portfolio Value**: `∑ (currentPrice × quantity)`
2. **Realized P&L**: `∑ (sellPrice - averageBuyPrice) × quantitySold`
3. **Unrealized P&L**: `∑ (currentPrice - averageBuyPrice) × remainingQuantity`
4. **Total P&L**: `realizedPnL + unrealizedPnL`
