## ADDED Requirements

### Requirement: Holdings Display with Real Data
The dashboard SHALL display user's portfolio holdings using the `getHoldings` GraphQL API.

#### Scenario: User views their portfolio holdings
- **WHEN** user navigates to the dashboard
- **THEN** the system calls `getHoldings` API with page=1, limit=10
- **AND** displays holdings in a table with columns: symbol, quantity, avgPrice, currentPrice, pnl, pnlPercent
- **AND** shows a badge indicating "profit" (green) or "loss" (red) based on the side field
- **AND** displays a loading spinner while fetching data
- **AND** formats currency values with 2 decimal places

#### Scenario: User has no holdings
- **WHEN** the API returns an empty holdings array
- **THEN** the system displays an empty state message: "No positions yet. Start trading to build your portfolio."

#### Scenario: API error occurs
- **WHEN** the `getHoldings` API fails
- **THEN** the system displays an error message: "Failed to load holdings. Please try again."
- **AND** logs the error to console for debugging

### Requirement: Recent Activities Display
The dashboard SHALL display user's recent transaction activities using the `getRecentActivities` GraphQL API.

#### Scenario: User views recent activities
- **WHEN** user views the Recent Activity section
- **THEN** the system calls `getRecentActivities` API with page=1, limit=3
- **AND** displays activities with type (BUY/SELL), ticker, shares, avgPrice, timestamp
- **AND** shows BUY actions with green indicator and SELL actions with red indicator
- **AND** formats timestamps as relative time (e.g., "2 hours ago")

#### Scenario: User has no transaction history
- **WHEN** the API returns an empty activities array
- **THEN** the system displays an empty state message: "No recent activities"

#### Scenario: Price comparison display
- **WHEN** activity currentPrice differs from avgPrice
- **THEN** the system shows the price difference as a subtle indicator
- **AND** uses green for gains, red for losses

### Requirement: Market Overview Display
The dashboard SHALL display market indices using the `getMarketOverview` GraphQL API.

#### Scenario: User views market overview
- **WHEN** user views the Market Overview section
- **THEN** the system calls `getMarketOverview` API with page=1, limit=6
- **AND** displays indices in a 2-column grid layout
- **AND** shows index label, value, unit, and trend indicator
- **AND** displays up arrow (green) for "up" trend, down arrow (red) for "down" trend, neutral icon for "neutral"

#### Scenario: Market data unavailable
- **WHEN** the API fails or returns no data
- **THEN** the system displays cached data if available
- **OR** shows error message: "Market data temporarily unavailable"

### Requirement: Top Movers Display
The dashboard SHALL display top gaining stocks using the `getTopMovers` GraphQL API.

#### Scenario: User views top movers
- **WHEN** user views the Top Movers section
- **THEN** the system calls `getTopMovers` API with page=1, limit=5, filter="gainers"
- **AND** displays stocks with symbol, avatar (if available), and percentage change
- **AND** shows positive percentages in green
- **AND** shows stock avatar or placeholder icon

#### Scenario: Stock has no avatar
- **WHEN** a stock's avatar field is null
- **THEN** the system displays a default stock icon placeholder

#### Scenario: User switches to top losers
- **WHEN** user clicks "View Losers" toggle (future enhancement)
- **THEN** the system calls API with filter="losers"
- **AND** displays negative percentages in red
