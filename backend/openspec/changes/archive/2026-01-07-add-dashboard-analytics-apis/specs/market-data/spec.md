## ADDED Requirements

### Requirement: Market Overview Query
The system SHALL provide a paginated query that returns market indices with trend indicators.

#### Scenario: User requests market overview
- **WHEN** a user queries `getMarketOverview(page: 1, limit: 10)`
- **THEN** the system returns an array of market indices
- **AND** each item includes key, label, value, unit, and trend fields
- **AND** supported indices include: sp500 (S&P 500), nasdaq (NASDAQ), dow (DOW), vix (VIX), us10y (10Y Treasury), dxy (USD Index)
- **AND** value represents the percentage change or absolute value for the index
- **AND** unit is "%" for percentage-based metrics or empty string for absolute values
- **AND** trend is "up" when value > 0, "down" when value < 0, "neutral" when value = 0
- **AND** the response includes pagination metadata

#### Scenario: Market data unavailable
- **WHEN** market index data cannot be fetched
- **THEN** the system returns available indices only
- **OR** returns cached data if available
- **AND** logs the error for monitoring

### Requirement: Top Movers Query
The system SHALL provide a paginated query that returns top gaining or losing stocks.

#### Scenario: User requests top gainers
- **WHEN** a user queries `getTopMovers(page: 1, limit: 10, filter: "gainers")`
- **THEN** the system calculates percentage change for all stocks from latest two MarketData records
- **AND** sorts stocks by percentage change in descending order
- **AND** returns top N stocks with symbol, avatar (from Stock table), and value (percentage change)
- **AND** the response includes pagination metadata

#### Scenario: User requests top losers
- **WHEN** a user queries `getTopMovers(page: 1, limit: 10, filter: "losers")`
- **THEN** the system sorts stocks by percentage change in ascending order (most negative first)
- **AND** returns the specified number of results

#### Scenario: Insufficient market data for comparison
- **WHEN** a stock has fewer than 2 MarketData records
- **THEN** that stock is excluded from top movers calculations

#### Scenario: Stock missing avatar
- **WHEN** a stock's avatar field is null or empty
- **THEN** the system returns null or a default placeholder URL for the avatar field
