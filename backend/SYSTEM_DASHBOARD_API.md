# System Dashboard API

## Overview

The System Dashboard API provides comprehensive metrics and analytics for the trading platform, including revenue, trades, performance indicators, and user analytics. All data is cached using Redis for optimal performance.

## GraphQL Query

### getSystemDashboard

```graphql
query GetSystemDashboard($input: SystemDashboardInput!) {
  getSystemDashboard(input: $input) {
    totalRevenue {
      startDate
      endDate
    }
    totalTradesExecuted {
      startDate
      endDate
    }
    winRate {
      startDate
      endDate
    }
    maxDrawdown {
      startDate
      endDate
    }
    equityAndDrawdown {
      date
      equity
      maxDrawdown
    }
    pnlOverTime {
      date
      pnl
    }
    mostTradedStocks {
      ticker
      companyName
      volume
      shareOfVolume
    }
    arpu {
      startDate
      endDate
    }
    churnRate {
      startDate
      endDate
    }
    averageTradeSize {
      startDate
      endDate
    }
    marginCallAlerts {
      startDate
      endDate
    }
    serviceUptime {
      startDate
      endDate
    }
    topUsers {
      id
      name
      avatar
      pnl
      totalValue
    }
  }
}
```

## Input Parameters

### SystemDashboardInput

```typescript
interface SystemDashboardInput {
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  compareStartDate?: string; // Optional comparison start date
  compareEndDate?: string; // Optional comparison end date
}
```

## Response Structure

### MetricWithDateRange

All metrics that support comparison return both start and end date values:

```typescript
interface MetricWithDateRange {
  startDate: number; // Value for comparison period (if provided)
  endDate: number; // Value for main period
}
```

### Available Metrics

1. **totalRevenue** - Platform revenue from transaction fees (0.1% per trade)
2. **totalTradesExecuted** - Number of completed transactions
3. **winRate** - Percentage of profitable trades
4. **maxDrawdown** - Maximum portfolio drawdown percentage
5. **equityAndDrawdown** - Daily equity curve and drawdown data
6. **pnlOverTime** - Daily profit/loss data
7. **mostTradedStocks** - Top stocks by trading volume
8. **arpu** - Average Revenue Per User
9. **churnRate** - Percentage of users who stopped trading
10. **averageTradeSize** - Average transaction value
11. **marginCallAlerts** - Number of margin call alerts
12. **serviceUptime** - Platform uptime percentage
13. **topUsers** - Top performing users by P&L

## Usage Examples

### Basic Query

```javascript
const input = {
  startDate: '2025-01-01',
  endDate: '2025-01-31',
};

const result = await client.query({
  query: GET_SYSTEM_DASHBOARD,
  variables: { input },
});
```

### With Comparison Period

```javascript
const input = {
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  compareStartDate: '2024-12-01',
  compareEndDate: '2024-12-31',
};
```

## Caching

- **Cache Duration**: 5 minutes
- **Cache Key**: `system_dashboard:{startDate}:{endDate}`
- **Cache Provider**: Redis (Upstash)

## Performance Considerations

1. **Parallel Processing**: All metrics are calculated in parallel using `Promise.all()`
2. **Redis Caching**: Results are cached for 5 minutes to reduce database load
3. **Optimized Queries**: Uses efficient Prisma queries with proper indexing
4. **Batch Processing**: Groups transactions by user/ticker for efficient P&L calculations

## Error Handling

The API includes comprehensive error handling:

- Database connection errors
- Invalid date ranges
- Missing data scenarios
- Redis connection failures

## Frontend Integration

The API is designed to work seamlessly with the React frontend:

```typescript
import { useSystemDashboard } from '@/lib/hooks/useSystemDashboard';

function AdminDashboard() {
  const { data, loading, error, refetch } = useSystemDashboard({
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Revenue: ${data.totalRevenue.endDate.toLocaleString()}</h1>
      <h2>Trades: {data.totalTradesExecuted.endDate.toLocaleString()}</h2>
      {/* ... other metrics */}
    </div>
  );
}
```

## Testing

Use the provided test script to verify the API:

```bash
cd backend
node test-system-dashboard.js
```

## Database Schema Requirements

The API requires the following database tables:

- `users` - User information
- `transactions` - Trading transactions
- `portfolios` - User portfolio positions
- `stocks` - Stock information
- `balances` - User account balances
- `alertRules` - Alert configurations

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live dashboard updates
2. **Advanced Analytics**: More sophisticated P&L calculations
3. **Custom Date Ranges**: Support for custom time periods
4. **Export Functionality**: CSV/PDF export of dashboard data
5. **Role-based Access**: Admin-only access controls
