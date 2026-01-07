# Implementation Tasks

## 1. Holdings with P&L API
- [x] 1.1 Create `HoldingPaginationInput` DTO in `src/portfolio/dto/holding.input.ts`
- [x] 1.2 Create `Holding` entity with symbol, quantity, avgPrice, currentPrice, pnl, pnlPercent, side fields
- [x] 1.3 Create `HoldingPaginationResponse` entity with data, total, page, totalPages
- [x] 1.4 Add `getHoldings()` method in `PortfolioService` that calculates P&L per position
- [x] 1.5 Add `getHoldings` query resolver in `PortfolioResolver` with pagination support
- [x] 1.6 Fetch current prices from MarketData for P&L calculations
- [x] 1.7 Determine side (profit/loss) based on P&L value
- [x] 1.8 Add tests for holdings P&L calculation edge cases

## 2. Recent Activities API
- [x] 2.1 Create `ActivityPaginationInput` DTO in `src/transaction/dto/activity.input.ts`
- [x] 2.2 Create `Activity` entity with type, timestamp, avgPrice, currentPrice fields
- [x] 2.3 Create `ActivityPaginationResponse` entity
- [x] 2.4 Add `getRecentActivities()` method in `TransactionService` that aggregates transactions
- [x] 2.5 Add `getRecentActivities` query resolver in `TransactionResolver`
- [x] 2.6 Map transaction actions to activity types (BUY/SELL)
- [x] 2.7 Fetch current prices for price comparison
- [x] 2.8 Sort activities by timestamp descending
- [x] 2.9 Add tests for activity aggregation

## 3. Market Overview API
- [x] 3.1 Create `MarketOverviewPaginationInput` DTO in `src/market-data/dto/market-overview.input.ts`
- [x] 3.2 Create `MarketOverviewItem` entity with key, label, value, unit, trend fields
- [x] 3.3 Create `MarketOverviewPaginationResponse` entity
- [x] 3.4 Create or update `MarketDataService` with `getMarketOverview()` method
- [x] 3.5 Implement data fetching for S&P 500, NASDAQ, DOW, VIX, 10Y Treasury, USD Index
- [x] 3.6 Calculate trend (up/down/neutral) based on price changes
- [x] 3.7 Add `getMarketOverview` query resolver in market-data resolver
- [x] 3.8 Add pagination support
- [x] 3.9 Consider caching strategy for market indices data
- [x] 3.10 Add tests for trend calculation

## 4. Top Movers API
- [x] 4.1 Create `TopMoversPaginationInput` DTO in `src/market-data/dto/top-movers.input.ts`
- [x] 4.2 Create `TopMover` entity with symbol, avatar, value (percentage change) fields
- [x] 4.3 Create `TopMoversPaginationResponse` entity
- [x] 4.4 Add `getTopMovers()` method in `MarketDataService`
- [x] 4.5 Calculate percentage change from MarketData table (today vs yesterday)
- [x] 4.6 Sort by percentage change (descending for gainers, ascending for losers)
- [x] 4.7 Join with Stock table to fetch avatar URLs
- [x] 4.8 Add `getTopMovers` query resolver
- [x] 4.9 Add filter parameter for gainers vs losers
- [x] 4.10 Add tests for top movers calculation

## 5. Integration & Testing
- [x] 5.1 Update GraphQL schema with new queries and types
- [x] 5.2 Add integration tests for all four endpoints
- [x] 5.3 Test pagination edge cases (empty results, last page, etc.)
- [x] 5.4 Test with real market data
- [x] 5.5 Verify performance with large datasets
- [x] 5.6 Update API documentation
- [x] 5.7 Add example queries for frontend teams

## 6. Optional Enhancements
- [ ] 6.1 Add caching for market overview data (Redis)
- [ ] 6.2 Add filtering by date range for recent activities
- [ ] 6.3 Add filtering by symbol for holdings
- [ ] 6.4 Add sorting options for all endpoints
