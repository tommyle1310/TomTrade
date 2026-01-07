# Change: Integrate User Metric Cards API in Dashboard

## Why
The backend now provides a `getUserMetricCards` GraphQL API that returns standardized metric card data (Portfolio Value, Total P&L, Open Positions, Account Status). The frontend UserDashboard currently uses mock data for these cards. We need to integrate the real API using TanStack Query to fetch and display live data, removing the mock data and providing accurate real-time metrics to users.

## What Changes
- Add GraphQL query definition for `getUserMetricCards` in `lib/graphqlClient.ts` or new query file
- Create TanStack Query hook to fetch metric cards data
- Replace mock metric card data in `UserDashboard.tsx` with real API data
- Update metric card display logic to use fetched data structure
- Add loading and error states for metric cards
- Maintain existing UI/UX with animations and styling

## Impact
- Affected specs: `dashboard` (new capability for user dashboard data fetching)
- Affected code:
  - `lib/graphqlClient.ts` or new `lib/dashboardQueries.ts` - Add GraphQL query
  - `components/user/UserDashboard.tsx` - Integrate TanStack Query, remove mocks
  - `lib/types.ts` - Add TypeScript types for MetricCard
- No breaking changes
- Removes hardcoded mock data, replacing with live backend integration