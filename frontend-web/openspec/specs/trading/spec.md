# trading Specification

## Purpose
TBD - created by archiving change add-trading-interface. Update Purpose after archive.
## Requirements
### Requirement: Quick Trade Modal
The system SHALL provide a Quick Trade Modal for simple order placement from the dashboard.

#### Scenario: User opens Quick Trade Modal from dashboard Buy button
- **WHEN** user clicks the "Buy" button in the dashboard header
- **THEN** the system opens the Quick Trade Modal with side pre-selected as "BUY"
- **AND** displays form fields: ticker (text input), quantity (number input), price (number input)
- **AND** shows a total cost preview (quantity × price)
- **AND** displays Buy/Sell toggle defaulted to "Buy"

#### Scenario: User opens Quick Trade Modal from dashboard Sell button
- **WHEN** user clicks the "Sell" button in the dashboard header
- **THEN** the system opens the Quick Trade Modal with side pre-selected as "SELL"
- **AND** pre-populates form with same fields as Buy scenario
- **AND** displays Buy/Sell toggle defaulted to "Sell"

#### Scenario: User submits valid order in Quick Trade Modal
- **WHEN** user fills ticker="AAPL", quantity=10, price=150, side="BUY"
- **AND** clicks "Place Order" button
- **THEN** the system calls `placeOrder` GraphQL mutation with PlaceOrderInput
- **AND** displays loading spinner on submit button
- **AND** shows success toast notification "Order placed successfully"
- **AND** closes modal after 1 second
- **AND** refreshes dashboard holdings/activities data

#### Scenario: User submits invalid order (missing fields)
- **WHEN** user leaves ticker or quantity empty
- **AND** clicks "Place Order" button
- **THEN** the system displays inline validation errors "This field is required"
- **AND** prevents API call until fields are valid

#### Scenario: Order placement fails due to insufficient balance
- **WHEN** user submits order but backend returns error "Insufficient balance"
- **THEN** the system displays error toast "Order failed: Insufficient balance"
- **AND** keeps modal open for user to adjust order
- **AND** enables the submit button again

#### Scenario: User navigates to Advanced Trading from modal
- **WHEN** user clicks "View Advanced Trading" link in modal footer
- **THEN** the system navigates to `/trade` page
- **AND** passes ticker from modal as URL parameter `/trade?ticker=AAPL`
- **AND** closes the Quick Trade Modal

### Requirement: Advanced Trading Page
The system SHALL provide an Advanced Trading Page with order book visualization and comprehensive trading controls.

#### Scenario: User navigates to Advanced Trading Page
- **WHEN** user navigates to `/trade` URL
- **THEN** the system displays a three-column layout: OrderForm (left), OrderBook (center), MarketData (right)
- **AND** shows ticker selector with search/autocomplete at the top
- **AND** defaults to "AAPL" if no ticker parameter provided

#### Scenario: User navigates with ticker parameter
- **WHEN** user navigates to `/trade?ticker=TSLA`
- **THEN** the system pre-selects "TSLA" in ticker selector
- **AND** fetches order book data for TSLA
- **AND** displays TSLA market data and price chart

#### Scenario: User views order book
- **WHEN** user selects a ticker
- **THEN** the system calls `orderBook` query with ticker parameter
- **AND** displays bids in left column (green) sorted by price descending
- **AND** displays asks in right column (red) sorted by price ascending
- **AND** shows depth bars for each price level (quantity visualization)
- **AND** displays spread indicator between best bid and best ask
- **AND** refreshes order book data every 2 seconds

#### Scenario: Order book data unavailable
- **WHEN** the `orderBook` query fails or returns no data
- **THEN** the system displays "Order book unavailable for this ticker"
- **AND** allows user to continue placing orders (market orders)

#### Scenario: User places order from Advanced Trading Page
- **WHEN** user fills order form with ticker="NVDA", quantity=5, price=500, type="LIMIT"
- **AND** clicks "Place Order" button
- **THEN** the system shows confirmation dialog with order summary
- **AND** on confirm, calls `placeOrder` mutation
- **AND** displays success toast "Order placed successfully"
- **AND** adds order to "My Orders" section below the form
- **AND** keeps user on the same page for continued trading

### Requirement: Order Form Component
The system SHALL provide a reusable Order Form component with support for multiple order types.

#### Scenario: User selects LIMIT order type
- **WHEN** user selects "Limit" tab in order form
- **THEN** the system displays fields: ticker, quantity, limit price, side (BUY/SELL), time in force (GTC default)
- **AND** calculates total cost/proceeds preview
- **AND** shows estimated execution probability (if available)

#### Scenario: User selects MARKET order type
- **WHEN** user selects "Market" tab in order form
- **THEN** the system displays fields: ticker, quantity, side (BUY/SELL)
- **AND** hides price field (market price used)
- **AND** shows current market price reference
- **AND** calculates estimated total based on current market price

#### Scenario: User selects STOP order type
- **WHEN** user selects "Stop" tab in order form
- **THEN** the system displays fields: ticker, quantity, stop price, limit price (optional), side
- **AND** shows helper text explaining stop order execution
- **AND** validates stop price is appropriate for side (stop sell < current, stop buy > current)

#### Scenario: User views order history in trading page
- **WHEN** user scrolls to "My Orders" section below order form
- **THEN** the system displays recent orders with status (PENDING, FILLED, CANCELLED, REJECTED)
- **AND** allows user to cancel pending orders with cancel button
- **AND** shows order details: ticker, type, quantity, price, timestamp, status

### Requirement: Order Book Display Component
The system SHALL provide real-time order book visualization with depth indication.

#### Scenario: User views order book with depth bars
- **WHEN** order book data is loaded
- **THEN** the system displays each price level with quantity and depth bar
- **AND** depth bar width is proportional to quantity relative to max quantity in visible levels
- **AND** bids (buy orders) show green depth bars on the left
- **AND** asks (sell orders) show red depth bars on the right

#### Scenario: User clicks on order book price level
- **WHEN** user clicks a bid or ask price in the order book
- **THEN** the system auto-fills the order form price field with clicked price
- **AND** highlights the clicked price level temporarily (2 seconds)
- **AND** focuses the quantity input field for quick order entry

#### Scenario: Order book updates in real-time
- **WHEN** 2 seconds pass since last order book fetch
- **THEN** the system automatically fetches updated order book data
- **AND** smoothly updates the display without jarring re-renders
- **AND** maintains scroll position in order book

### Requirement: Market Data Display
The system SHALL display comprehensive market data for selected ticker on the Advanced Trading Page.

#### Scenario: User views market data panel
- **WHEN** user selects a ticker
- **THEN** the system displays current price, 24h high, 24h low, 24h volume, market cap
- **AND** shows percentage change with color coding (green for positive, red for negative)
- **AND** displays mini candlestick chart for last 24 hours
- **AND** shows recent trades list (last 10 trades) with price, quantity, timestamp

#### Scenario: Price updates in real-time
- **WHEN** WebSocket connection is active (future enhancement)
- **THEN** the system receives price updates and refreshes current price display
- **AND** animates price change (flash green on increase, red on decrease)
- **AND** updates the mini chart with new data point

#### Scenario: WebSocket unavailable, fallback to polling
- **WHEN** WebSocket connection fails to establish
- **THEN** the system falls back to polling market data every 5 seconds
- **AND** displays notification "Live updates unavailable, using polling"

