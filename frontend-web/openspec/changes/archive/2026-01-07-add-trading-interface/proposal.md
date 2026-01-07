# Change: Add Trading Interface with Quick Trade Modal and Advanced Trading Page

## Why
Users currently see Buy/Sell buttons in the dashboard but cannot execute trades. The platform needs a complete trading interface that supports both quick trades for simplicity and an advanced trading page for detailed analysis with order book visualization.

## What Changes
- Add Quick Trade Modal component with basic order placement (ticker, price, quantity, side)
- Add Advanced Trading Page with order book display, real-time market data, and enhanced order controls
- Integrate `placeOrder` GraphQL mutation from backend (already implemented in `order.resolver.ts`)
- Add modal state management and navigation from dashboard Buy/Sell buttons
- Implement order book visualization using existing `orderBook` query
- Add order confirmation and success/error feedback
- Create TypeScript types for order placement and order book data
- Add GraphQL client functions for `placeOrder` and `orderBook` queries

## Impact
- **Affected specs**: 
  - NEW: `trading` (new capability for order placement and trading interface)
  - `user-dashboard` (existing - modified to integrate Buy/Sell button actions)
- **Affected code**:
  - `components/user/UserDashboard.tsx` - Add modal trigger handlers to Buy/Sell buttons
  - `lib/graphqlClient.ts` - Add `placeOrder` mutation and `orderBook` query functions
  - `lib/types.ts` - Add PlaceOrderInput, Order, OrderBook, OrderBookEntry types
  - `components/trading/QuickTradeModal.tsx` - NEW component for simple trades
  - `app/(authenticated)/trade/page.tsx` - NEW page for advanced trading
  - `components/trading/OrderBookDisplay.tsx` - NEW component for order book visualization
  - `components/trading/OrderForm.tsx` - NEW reusable order form component
- **Breaking changes**: None
