## ADDED Requirements

### Requirement: Holdings with P&L Query
The system SHALL provide a paginated query that returns user holdings with profit/loss calculations.

#### Scenario: User requests holdings with pagination
- **WHEN** an authenticated user queries `getHoldings(page: 1, limit: 10)`
- **THEN** the system returns an array of holdings containing symbol, quantity, avgPrice, currentPrice, pnl, pnlPercent, and side fields
- **AND** each holding's currentPrice is fetched from the latest MarketData record
- **AND** pnl is calculated as `(currentPrice - avgPrice) * quantity`
- **AND** pnlPercent is calculated as `((currentPrice - avgPrice) / avgPrice) * 100`
- **AND** side is set to "profit" when pnl > 0, "loss" when pnl < 0, or "neutral" when pnl = 0
- **AND** the response includes pagination metadata (total, page, totalPages)

#### Scenario: Holdings with no current price data
- **WHEN** a holding's stock has no MarketData records
- **THEN** currentPrice defaults to avgPrice
- **AND** pnl and pnlPercent are both 0
- **AND** side is set to "neutral"

#### Scenario: Empty holdings
- **WHEN** a user has no portfolio positions
- **THEN** the system returns an empty data array with total count of 0

### Requirement: Recent Activities Query
The system SHALL provide a paginated query that returns unified activity history with price comparisons.

#### Scenario: User requests recent activities
- **WHEN** an authenticated user queries `getRecentActivities(page: 1, limit: 20)`
- **THEN** the system returns an array of activities from the Transaction table
- **AND** each activity includes type (BUY/SELL), timestamp, avgPrice (transaction price), and currentPrice (latest market price)
- **AND** activities are sorted by timestamp in descending order (most recent first)
- **AND** currentPrice is fetched from the latest MarketData for the stock symbol
- **AND** the response includes pagination metadata

#### Scenario: Activities without current price
- **WHEN** a transaction's stock has no current MarketData
- **THEN** currentPrice defaults to the transaction's avgPrice

#### Scenario: Empty activities
- **WHEN** a user has no transaction history
- **THEN** the system returns an empty data array with total count of 0
