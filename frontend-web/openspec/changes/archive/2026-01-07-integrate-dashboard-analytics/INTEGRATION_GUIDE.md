# Dashboard Analytics Integration Guide

Quick reference for integrating the four new backend APIs into the UserDashboard component.

## Backend APIs (Already Implemented ✅)

1. **getHoldings** - Portfolio holdings with P&L
2. **getRecentActivities** - Transaction history with price comparisons  
3. **getMarketOverview** - Market indices with trends
4. **getTopMovers** - Top gaining/losing stocks

See backend API examples: `backend/openspec/changes/archive/2026-01-07-add-dashboard-analytics-apis/API_EXAMPLES.md`

## Frontend Integration Pattern

Follow the existing `useUserMetricCards` pattern for each new hook:

```typescript
// lib/hooks/useHoldings.ts
import { useState, useEffect } from 'react';
import { getHoldings } from '../graphqlClient';
import { HoldingPaginationResponse } from '../types';
import { useAuthStore } from '../authStore';

export function useHoldings(page = 1, limit = 10) {
  const [data, setData] = useState<HoldingPaginationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function fetchHoldings() {
      try {
        setLoading(true);
        setError(null);
        const result = await getHoldings(page, limit, token || undefined);
        if (isMounted) {
          setData(result.getHoldings);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching holdings:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch holdings'));
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchHoldings();
    } else {
      setLoading(false);
      setError(new Error('No authentication token'));
    }

    return () => { isMounted = false; };
  }, [token, page, limit]);

  return { data, loading, error };
}
```

## GraphQL Query Example

```typescript
// lib/graphqlClient.ts
export async function getHoldings(page = 1, limit = 10, token?: string) {
  const query = `
    query GetHoldings($input: HoldingPaginationInput!) {
      getHoldings(input: $input) {
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
  `;

  const variables = { input: { page, limit } };
  return graphqlRequest<{ getHoldings: HoldingPaginationResponse }>(query, variables, token);
}
```

## TypeScript Types

```typescript
// lib/types.ts
export interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  side: string; // "profit" | "loss" | "neutral"
}

export interface HoldingPaginationResponse {
  data: Holding[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Activity {
  type: string; // "BUY" | "SELL"
  timestamp: string;
  ticker: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface ActivityPaginationResponse {
  data: Activity[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MarketOverviewItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  trend: string; // "up" | "down" | "neutral"
}

export interface MarketOverviewPaginationResponse {
  data: MarketOverviewItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TopMover {
  symbol: string;
  avatar: string | null;
  value: number; // percentage change
}

export interface TopMoversPaginationResponse {
  data: TopMover[];
  total: number;
  page: number;
  totalPages: number;
}
```

## UserDashboard.tsx Integration

Replace mock data with hooks:

```tsx
// components/user/UserDashboard.tsx
import { useHoldings } from "@/lib/hooks/useHoldings";
import { useRecentActivities } from "@/lib/hooks/useRecentActivities";
import { useMarketOverview } from "@/lib/hooks/useMarketOverview";
import { useTopMovers } from "@/lib/hooks/useTopMovers";

export default function UserDashboard() {
  // ... existing code ...
  
  const { data: holdings, loading: holdingsLoading, error: holdingsError } = useHoldings(1, 10);
  const { data: activities, loading: activitiesLoading, error: activitiesError } = useRecentActivities(1, 3);
  const { data: marketOverview, loading: marketLoading, error: marketError } = useMarketOverview(1, 6);
  const { data: topMovers, loading: moversLoading, error: moversError } = useTopMovers(1, 5, 'gainers');

  // Replace mockPortfolio with holdings?.data || []
  // Replace mockWatchlist stays as is (different API)
  // Update recent activity section to use activities?.data || []
  // Update market overview section to use marketOverview?.data || []
  // Update top movers section to use topMovers?.data || []
}
```

## UI Components to Update

### 1. Portfolio Table (holdings)
```tsx
{holdingsLoading ? (
  <Loader2 className="size-4 animate-spin" />
) : holdingsError ? (
  <p className="text-sm text-danger">Failed to load holdings</p>
) : holdings?.data.length === 0 ? (
  <p className="text-sm text-muted-foreground">No positions yet</p>
) : (
  <Table>
    <TableBody>
      {holdings?.data.map((holding) => (
        <TableRow key={holding.symbol}>
          <TableCell>{holding.symbol}</TableCell>
          <TableCell>{holding.quantity}</TableCell>
          <TableCell>${holding.avgPrice.toFixed(2)}</TableCell>
          <TableCell>${holding.currentPrice.toFixed(2)}</TableCell>
          <TableCell>
            <Badge variant={holding.side === 'profit' ? 'success' : 'destructive'}>
              ${holding.pnl.toFixed(2)} ({holding.pnlPercent.toFixed(2)}%)
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}
```

### 2. Recent Activity
```tsx
{activitiesLoading ? (
  <Loader2 className="size-4 animate-spin" />
) : activities?.data.map((activity) => (
  <div key={activity.timestamp} className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Badge variant={activity.type === 'BUY' ? 'success' : 'destructive'}>
        {activity.type}
      </Badge>
      <div>
        <p className="font-medium">{activity.ticker}</p>
        <p className="text-xs text-muted-foreground">
          {activity.shares} shares @ ${activity.avgPrice.toFixed(2)}
        </p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm">${activity.currentPrice.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(activity.timestamp).toLocaleTimeString()}
      </p>
    </div>
  </div>
))}
```

### 3. Market Overview
```tsx
{marketLoading ? (
  <Loader2 className="size-4 animate-spin" />
) : marketOverview?.data.map((item) => (
  <div key={item.key} className="space-y-2">
    <p className="text-sm text-muted-foreground">{item.label}</p>
    <div className="flex items-center gap-2">
      <p className="text-lg font-bold">
        {item.value > 0 && '+'}{item.value}{item.unit}
      </p>
      {item.trend === 'up' && <TrendingUp className="size-4 text-success" />}
      {item.trend === 'down' && <TrendingDown className="size-4 text-danger" />}
    </div>
  </div>
))}
```

### 4. Top Movers
```tsx
{moversLoading ? (
  <Loader2 className="size-4 animate-spin" />
) : topMovers?.data.map((mover) => (
  <div key={mover.symbol} className="flex justify-between items-center">
    <div className="flex items-center gap-2">
      {mover.avatar ? (
        <img src={mover.avatar} alt={mover.symbol} className="size-6 rounded-full" />
      ) : (
        <div className="size-6 rounded-full bg-muted flex items-center justify-center">
          <BarChart3 className="size-3" />
        </div>
      )}
      <span className="font-medium">{mover.symbol}</span>
    </div>
    <Badge variant={mover.value > 0 ? 'success' : 'destructive'}>
      {mover.value > 0 && '+'}{mover.value.toFixed(2)}%
    </Badge>
  </div>
))}
```

## Testing Checklist

- [ ] All 4 hooks fetch data successfully
- [ ] Loading states display correctly
- [ ] Error states handle failures gracefully
- [ ] Empty states show when no data
- [ ] Currency formatting is consistent
- [ ] Color indicators match profit/loss correctly
- [ ] Timestamps display in readable format
- [ ] Pagination parameters are correct
- [ ] Auth token is passed properly
- [ ] Real-time updates work when data changes

## Next Steps

1. Implement all 4 hooks following the pattern above
2. Add TypeScript types to `types.ts`
3. Add query functions to `graphqlClient.ts`
4. Update `UserDashboard.tsx` to use new hooks
5. Test with real backend data
6. Remove unused mock data constants
