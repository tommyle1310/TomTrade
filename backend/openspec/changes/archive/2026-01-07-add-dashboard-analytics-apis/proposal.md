# Change: Add Dashboard Analytics APIs

## Why
The frontend user dashboard needs detailed, paginated data for four key sections: holdings with P&L, recent activities, market overview indices, and top movers. Currently, the backend only provides basic portfolio and transaction lists without pagination, P&L calculations per holding, market indices, or stock performance rankings. This makes it impossible to build a comprehensive dashboard with real-time analytics.

## What Changes
- Add `getHoldings` query with pagination that returns holdings with calculated P&L, percentage gain/loss, and profit/loss side
- Add `getRecentActivities` query with pagination that returns unified activity history (buy/sell/deposits) with price comparisons
- Add `getMarketOverview` query with pagination that returns market indices (S&P 500, NASDAQ, DOW, VIX, Treasury yields, USD Index) with trends
- Add `getTopMovers` query with pagination that returns top gaining/losing stocks with avatars and percentage changes
- All queries support standard pagination (page, limit) and return properly typed GraphQL responses
- Leverage existing portfolio, transaction, and market data without schema changes

## Impact
- Affected specs: `portfolio` (new capability: holdings with P&L), `market-data` (new capability: overview and top movers)
- Affected code:
  - `src/portfolio/portfolio.resolver.ts` - Add `getHoldings` query
  - `src/portfolio/portfolio.service.ts` - Add holdings P&L calculation logic
  - `src/portfolio/dto/` - Add `HoldingPaginationInput`
  - `src/portfolio/entities/` - Add `Holding`, `HoldingPaginationResponse`
  - `src/market-data/market-data.resolver.ts` - Add `getMarketOverview` and `getTopMovers` queries
  - `src/market-data/market-data.service.ts` - Add market indices and top movers logic
  - `src/market-data/dto/` - Add pagination inputs
  - `src/market-data/entities/` - Add market overview and top mover entities
  - `src/transaction/transaction.resolver.ts` - Enhance for recent activities
  - `src/transaction/transaction.service.ts` - Add activity aggregation logic
  - `src/transaction/dto/` - Add `ActivityPaginationInput`
  - `src/transaction/entities/` - Add `Activity`, `ActivityPaginationResponse`
- No breaking changes
- No database schema changes (uses existing Portfolio, Transaction, MarketData tables)
