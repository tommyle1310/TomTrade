# Dashboard Seeder API

This API provides functionality to generate realistic fake data for the system dashboard, allowing you to test and demonstrate the dashboard with meaningful data.

## Overview

The Dashboard Seeder API consists of:

- **SystemDashboardSeederService**: Backend service that generates fake data
- **SystemDashboardSeederResolver**: GraphQL resolver exposing the API endpoints
- **Frontend Integration**: React hooks and components for controlling the seeder

## Features

- ✅ **Toggleable Seeding**: Start/stop data generation on demand
- ✅ **Realistic Data**: Generates transactions, market data, orders, and portfolio updates
- ✅ **Redis Cache Management**: Automatically clears cache to prevent stale data
- ✅ **Admin-Only Access**: Restricted to users with ADMIN role
- ✅ **Real-time Status**: Monitor seeding status in real-time
- ✅ **Automatic Intervals**: Continues generating data every 30 seconds when active

## API Endpoints

### 1. Start Dashboard Seeding

**GraphQL Mutation:**

```graphql
mutation StartDashboardSeeding($startDate: String!, $endDate: String!) {
  startDashboardSeeding(startDate: $startDate, endDate: $endDate)
}
```

**Variables:**

```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**Response:**

```json
{
  "data": {
    "startDashboardSeeding": "{\"status\":\"started\",\"message\":\"Data seeding started successfully for 2025-01-01 to 2025-01-31\"}"
  }
}
```

### 2. Stop Dashboard Seeding

**GraphQL Mutation:**

```graphql
mutation StopDashboardSeeding {
  stopDashboardSeeding
}
```

**Response:**

```json
{
  "data": {
    "stopDashboardSeeding": "{\"status\":\"stopped\",\"message\":\"Data seeding stopped successfully\"}"
  }
}
```

### 3. Get Seeding Status

**GraphQL Query:**

```graphql
query GetDashboardSeedingStatus {
  getDashboardSeedingStatus
}
```

**Response:**

```json
{
  "data": {
    "getDashboardSeedingStatus": "{\"isSeeding\":true,\"status\":\"active\",\"dateRange\":{\"startDate\":\"2025-01-01\",\"endDate\":\"2025-01-31\"}}"
  }
}
```

## Data Generation

The seeder generates the following types of data:

### 1. Transactions

- **Volume**: 5-15 transactions per day
- **Users**: Random selection from existing users
- **Stocks**: Random selection from available stocks
- **Actions**: BUY/SELL with realistic prices and quantities
- **Timestamps**: Distributed throughout each day

### 2. Market Data

- **Daily OHLCV**: Open, High, Low, Close, Volume for each stock
- **Price Variations**: Realistic price movements with volatility
- **Volume**: Random but realistic trading volumes

### 3. Orders

- **Types**: LIMIT and MARKET orders
- **Status**: OPEN and FILLED orders
- **Quantities**: Realistic order sizes
- **Prices**: Market-appropriate pricing

### 4. Portfolio Updates

- **Holdings**: Random stock positions for users
- **Quantities**: Realistic share amounts
- **Average Prices**: Market-appropriate entry prices

## Frontend Integration

### React Hook: `useDashboardSeeder`

```typescript
import { useDashboardSeeder } from '@/lib/hooks/useDashboardSeeder';

const { status, loading, error, toggleSeeding, startSeeding, stopSeeding } =
  useDashboardSeeder();
```

### Usage in Components

```typescript
// Toggle button
<Button
  onClick={toggleSeeding}
  disabled={loading}
  variant={status.isSeeding ? "destructive" : "default"}
>
  {status.isSeeding ? "Stop Seeding" : "Start Seeding"}
</Button>

// Status indicator
{status.isSeeding && (
  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
    <span>Data Seeding Active</span>
  </div>
)}
```

## Testing

### Test Script

Run the test script to verify the API:

```bash
cd backend
node test-dashboard-seeder.js
```

The test script will:

1. Login as admin user
2. Check initial seeding status
3. Start seeding
4. Verify dashboard data changes
5. Stop seeding
6. Confirm final status

### Manual Testing

1. **Start Seeding**: Call `startDashboardSeeding` mutation
2. **Check Status**: Query `getDashboardSeedingStatus`
3. **View Dashboard**: Refresh the admin dashboard to see new data
4. **Stop Seeding**: Call `stopDashboardSeeding` mutation

## Configuration

### Seeding Interval

The seeder runs every 2 seconds when active. To modify:

```typescript
// In SystemDashboardSeederService
this.seedingInterval = setInterval(async () => {
  if (this.isSeeding) {
    await this.generateSeedingData();
  }
}, 2000); // Change this value (in milliseconds)
```

### Data Volume

Adjust the amount of data generated:

```typescript
// Transactions per day
const transactionsCount = Math.floor(Math.random() * 10) + 5; // 5-15

// Orders per day
const ordersCount = Math.floor(Math.random() * 5) + 2; // 2-7

// Portfolio probability
if (Math.random() > 0.7) {
  // 30% chance
  // Create portfolio entry
}
```

## Security

- **Authentication Required**: All endpoints require valid JWT token
- **Admin Role Required**: Only users with ADMIN role can access
- **Rate Limiting**: Consider implementing rate limiting for production

## Error Handling

The API includes comprehensive error handling:

- **Duplicate Start**: Returns "already_seeding" status
- **Stop When Inactive**: Returns "not_seeding" status
- **Authentication Errors**: Proper error messages for unauthorized access
- **Database Errors**: Graceful handling of database operation failures

## Monitoring

### Logs

The service logs all operations:

```
[SystemDashboardSeederService] Starting system dashboard data seeding...
[SystemDashboardSeederService] Generated seeding data successfully
[SystemDashboardSeederService] Cleared 3 Redis cache keys
```

### Status Tracking

Monitor seeding status in real-time:

- Active/Inactive status
- Error messages
- Loading states

## Integration with System Dashboard

The seeder is designed to work seamlessly with the existing system dashboard:

1. **Cache Management**: Automatically clears Redis cache when starting
2. **Data Consistency**: Generates data within the expected date ranges
3. **Real-time Updates**: Dashboard reflects new data immediately
4. **Performance**: Efficient data generation without impacting dashboard performance

## Future Enhancements

Potential improvements:

- **Configurable Data Types**: Allow selective data generation
- **Custom Date Ranges**: Generate data for specific periods
- **Data Templates**: Predefined data scenarios
- **Export/Import**: Save and restore seeding configurations
- **Metrics**: Track seeding performance and data quality
