# Change: Integrate Dashboard Analytics APIs

## Why
The UserDashboard component currently displays mock data for portfolio holdings, recent activities, market overview, and top movers. The backend has implemented four new GraphQL APIs (`getHoldings`, `getRecentActivities`, `getMarketOverview`, `getTopMovers`) that provide real, paginated data with P&L calculations, current prices, and trend indicators. We need to replace the mock data with real API calls to provide users with accurate, live dashboard information.

## What Changes
- Create 4 new React hooks following the existing pattern (similar to `useUserMetricCards`):
  - `useHoldings` - Fetch portfolio holdings with P&L
  - `useRecentActivities` - Fetch transaction history with price comparisons
  - `useMarketOverview` - Fetch market indices with trends
  - `useTopMovers` - Fetch top gaining/losing stocks
- Add GraphQL query functions in `graphqlClient.ts` for all 4 endpoints
- Update TypeScript types in `types.ts` to match API response structures
- Replace mock data in `UserDashboard.tsx` with real API data using the new hooks
- Add loading states, error handling, and empty state UI
- Maintain pagination support (initial page: 1, limit: 10 for holdings/top movers, 20 for activities/overview)

## Impact
- Affected specs: `user-dashboard` (new capability: live data integration)
- Affected code:
  - `lib/graphqlClient.ts` - Add 4 new query functions
  - `lib/types.ts` - Add TypeScript types for all 4 APIs
  - `lib/hooks/useHoldings.ts` - New hook for holdings API
  - `lib/hooks/useRecentActivities.ts` - New hook for activities API
  - `lib/hooks/useMarketOverview.ts` - New hook for market overview API
  - `lib/hooks/useTopMovers.ts` - New hook for top movers API
  - `components/user/UserDashboard.tsx` - Replace mock data with hooks, add loading/error states
- No breaking changes
- Removes dependency on mock data arrays
- Improves user experience with real-time data
