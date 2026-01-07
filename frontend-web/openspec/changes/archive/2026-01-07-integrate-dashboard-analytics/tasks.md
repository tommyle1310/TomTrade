# Implementation Tasks

## 1. GraphQL Client & Types Setup
- [x] 1.1 Add TypeScript types to `lib/types.ts`:
  - [x] `Holding`, `HoldingPaginationResponse`
  - [x] `Activity`, `ActivityPaginationResponse`
  - [x] `MarketOverviewItem`, `MarketOverviewPaginationResponse`
  - [x] `TopMover`, `TopMoversPaginationResponse`
- [x] 1.2 Add `getHoldings` query function to `lib/graphqlClient.ts`
- [x] 1.3 Add `getRecentActivities` query function to `lib/graphqlClient.ts`
- [x] 1.4 Add `getMarketOverview` query function to `lib/graphqlClient.ts`
- [x] 1.5 Add `getTopMovers` query function to `lib/graphqlClient.ts`

## 2. Create React Hooks
- [x] 2.1 Create `lib/hooks/useHoldings.ts` with pagination support
- [x] 2.2 Create `lib/hooks/useRecentActivities.ts` with pagination support
- [x] 2.3 Create `lib/hooks/useMarketOverview.ts` with pagination support
- [x] 2.4 Create `lib/hooks/useTopMovers.ts` with filter support (gainers/losers)

## 3. Update UserDashboard Component
- [x] 3.1 Import all 4 new hooks at the top of the component
- [x] 3.2 Replace `mockPortfolio` with `useHoldings` hook
- [x] 3.3 Add loading spinner and error handling for portfolio section
- [x] 3.4 Replace recent activity mock data with `useRecentActivities` hook
- [x] 3.5 Add loading spinner and error handling for recent activity section
- [x] 3.6 Replace market overview mock data with `useMarketOverview` hook
- [x] 3.7 Add loading spinner and error handling for market overview section
- [x] 3.8 Replace top movers mock data with `useTopMovers` hook
- [x] 3.9 Add loading spinner and error handling for top movers section
- [x] 3.10 Remove unused mock data constants

## 4. UI Enhancements
- [x] 4.1 Update portfolio table to display `side` field (profit/loss badge)
- [x] 4.2 Format currency values consistently across all sections
- [x] 4.3 Add empty state UI when no holdings exist
- [x] 4.4 Add empty state UI when no activities exist
- [x] 4.5 Display trend indicators for market overview (up/down arrows)
- [x] 4.6 Show stock avatars in top movers section
- [x] 4.7 Add proper date/time formatting for activity timestamps

## 5. Testing & Refinement
- [x] 5.1 Test all API calls with real backend data
- [x] 5.2 Verify loading states appear correctly
- [x] 5.3 Test error scenarios (network failures, auth errors)
- [x] 5.4 Verify pagination works correctly
- [x] 5.5 Test responsive layout on mobile devices
- [x] 5.6 Verify real-time price updates reflect correctly
- [x] 5.7 Performance test with large datasets

## 6. Optional Enhancements
- [x] 6.1 Add refresh button for manual data reload
- [x] 6.2 Implement auto-refresh every 30 seconds
- [x] 6.3 Add pagination controls for holdings table
- [x] 6.4 Add "View More" button for recent activities
- [x] 6.5 Add filter toggle for top movers (gainers/losers)
- [x] 6.6 Add skeleton loaders for better UX
