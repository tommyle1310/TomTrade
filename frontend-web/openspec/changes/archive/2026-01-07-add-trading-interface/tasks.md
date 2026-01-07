## 1. GraphQL Client & Types Setup
- [x] 1.1 Add Order-related TypeScript interfaces to `lib/types.ts` (PlaceOrderInput, Order, OrderSide, OrderType, TimeInForce, OrderBook, OrderBookEntry)
- [x] 1.2 Add `placeOrder` mutation function to `lib/graphqlClient.ts`
- [x] 1.3 Add `orderBook` query function to `lib/graphqlClient.ts`
- [x] 1.4 Add `myOrders` query function to `lib/graphqlClient.ts`
- [x] 1.5 Add `cancelOrder` mutation function to `lib/graphqlClient.ts`

## 2. Quick Trade Modal Component
- [x] 2.1 Create `components/trading/QuickTradeModal.tsx` with Dialog component from shadcn/ui
- [x] 2.2 Add form fields for ticker, quantity, price, side (BUY/SELL toggle)
- [x] 2.3 Implement form validation using React Hook Form + Zod
- [x] 2.4 Add order preview with total cost calculation
- [x] 2.5 Integrate `placeOrder` mutation with loading and error states
- [x] 2.6 Add success confirmation with order details
- [x] 2.7 Add "View Advanced Trading" button that navigates to trading page

## 3. Update User Dashboard Integration
- [x] 3.1 Add state management for QuickTradeModal visibility
- [x] 3.2 Update Buy button to open modal with side="BUY" pre-selected
- [x] 3.3 Update Sell button to open modal with side="SELL" pre-selected
- [x] 3.4 Import and render QuickTradeModal component in UserDashboard

## 4. Advanced Trading Page
- [x] 4.1 Create `app/(authenticated)/trade/page.tsx` with page layout
- [x] 4.2 Add URL parameter support for pre-selected ticker (e.g., `/trade?ticker=AAPL`)
- [x] 4.3 Create main grid layout: OrderForm (left), OrderBook (center), MarketData (right)
- [x] 4.4 Add ticker search/selector component with autocomplete
- [x] 4.5 Implement real-time price updates (connect to WebSocket or polling)

## 5. Order Form Component
- [x] 5.1 Create `components/trading/OrderForm.tsx` with full order controls
- [x] 5.2 Add tabs for LIMIT, MARKET, STOP order types
- [x] 5.3 Add advanced fields: Time in Force (GTC, IOC, FOK), Stop Price
- [x] 5.4 Add order validation with balance check preview
- [x] 5.5 Implement "Place Order" action with confirmation dialog
- [x] 5.6 Add order history section showing user's recent orders

## 6. Order Book Display Component
- [x] 6.1 Create `components/trading/OrderBookDisplay.tsx`
- [x] 6.2 Fetch order book data using `orderBook` query for selected ticker
- [x] 6.3 Display bid/ask prices in two-column table with depth visualization
- [x] 6.4 Add color coding (green for bids, red for asks)
- [x] 6.5 Add depth bars showing order quantity volume
- [x] 6.6 Implement auto-refresh every 2 seconds for order book data
- [x] 6.7 Add spread indicator between best bid and best ask

## 7. Market Data Display
- [x] 7.1 Create `components/trading/MarketDataPanel.tsx`
- [x] 7.2 Display current price, 24h high/low, volume, market cap
- [x] 7.3 Add mini price chart using Recharts (last 24h candlestick)
- [x] 7.4 Show recent trades list with price, quantity, timestamp

## 8. UI Enhancements
- [ ] 8.1 Add loading skeletons for all data sections
- [ ] 8.2 Add error boundaries for trading components
- [ ] 8.3 Implement toast notifications for order success/failure
- [ ] 8.4 Add keyboard shortcuts (B for Buy, S for Sell, Esc to close modal)
- [ ] 8.5 Ensure responsive layout for mobile/tablet views
- [ ] 8.6 Add animations for modal transitions using Framer Motion

## 9. Testing & Validation
- [ ] 9.1 Test Quick Trade Modal with valid/invalid inputs
- [ ] 9.2 Test dashboard Buy/Sell button integration
- [ ] 9.3 Test Advanced Trading Page with different tickers
- [ ] 9.4 Test order book real-time updates
- [ ] 9.5 Test error handling for network failures
- [ ] 9.6 Test mobile responsiveness
- [ ] 9.7 Verify accessibility (keyboard navigation, screen readers)
