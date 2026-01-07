# Implementation Tasks

## 1. Define Types and GraphQL Query
- [x] 1.1 Add `MetricCard` interface to `lib/types.ts` matching backend schema
- [x] 1.2 Create GraphQL query string for `getUserMetricCards` in `lib/graphqlClient.ts`
- [x] 1.3 Add query function using gqlRequest pattern
- [x] 1.4 Export query for use in components

## 2. Create Custom React Hook
- [x] 2.1 Create custom hook `useUserMetricCards` using useState and useEffect
- [x] 2.2 Configure hook with proper error handling
- [x] 2.3 Handle loading, error, and success states
- [x] 2.4 Add TypeScript typing for query response
- [x] 2.5 Export hook from `lib/hooks/useUserMetricCards.ts`

## 3. Update UserDashboard Component
- [x] 3.1 Import `useUserMetricCards` hook in `UserDashboard.tsx`
- [x] 3.2 Replace mock data calculations with hook usage
- [x] 3.3 Update metric card rendering to use fetched data structure
- [x] 3.4 Add loading spinner (Loader2) for metric cards section
- [x] 3.5 Add error handling UI (error message inline)
- [x] 3.6 Preserve existing animations and styling
- [x] 3.7 Keep mock data for portfolio/watchlist sections (separate feature)

## 4. Data Mapping and Display
- [x] 4.1 Map `MetricCard.value` to display format (Portfolio Value card)
- [x] 4.2 Map `MetricCard.change` and `changeExtraData` (Total P&L card)
- [x] 4.3 Map `MetricCard.changeExtraData` for profitable count (Open Positions card)
- [x] 4.4 Map `MetricCard.extraData` for join date (Account Status card)
- [x] 4.5 Handle null/undefined values gracefully with fallbacks
- [x] 4.6 Format numbers and currencies consistently with toLocaleString and toFixed

## 5. Testing and Validation
- [ ] 5.1 Test with user having positions (verify accurate data display)
- [ ] 5.2 Test with user having no positions (verify zero values)
- [ ] 5.3 Test loading state during API call
- [ ] 5.4 Test error state with backend offline
- [ ] 5.5 Verify animations still work with real data
- [ ] 5.6 Test responsive layout on mobile/tablet/desktop

## 6. Cleanup
- [x] 6.1 Keep mock portfolio/watchlist data (separate from metric cards)
- [x] 6.2 Remove metric card mock calculations (replaced with API data)
- [ ] 6.3 Verify no console errors or warnings
- [x] 6.4 Update tasks.md with completion checkmarks