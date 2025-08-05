# Zustand State Management Guide

## Overview

The app now uses **Zustand** for state management instead of React Context + Apollo queries. This provides better performance, simpler code, and automatic persistence.

## Store Structure

### 1. **AuthStore** (`stores/authStore.ts`)

Manages user authentication and session state.

```typescript
import { useAuthStore } from '../stores';

// In your component
const { isAuthenticated, user, loading, login, logout, error } = useAuthStore();

// Login
await login({ email: 'user@example.com', password: 'password' });

// Logout
await logout();
```

**Features:**

- ✅ Automatic token persistence with AsyncStorage
- ✅ Auto-login on app restart
- ✅ Token validation with backend
- ✅ Error handling

### 2. **PortfolioStore** (`stores/portfolioStore.ts`)

Manages portfolio, dashboard, and financial data.

```typescript
import { usePortfolioStore } from '../stores';

// In your component
const {
  dashboard,
  balance,
  portfolio,
  transactions,
  orders,
  fetchDashboard,
  refreshAll,
} = usePortfolioStore();

// Fetch specific data
await fetchDashboard();

// Refresh all data
await refreshAll();
```

**Features:**

- ✅ Dashboard data (P&L, positions)
- ✅ Portfolio positions
- ✅ Transaction history
- ✅ Order management
- ✅ Balance tracking

### 3. **TradingStore** (`stores/tradingStore.ts`)

Manages trading operations and watchlists.

```typescript
import { useTradingStore } from '../stores';

// In your component
const { stocks, watchlists, placeOrder, createWatchlist, orderLoading } =
  useTradingStore();

// Place an order
await placeOrder({
  ticker: 'AAPL',
  side: 'BUY',
  type: 'LIMIT',
  quantity: 10,
  price: 150.0,
});

// Create watchlist
await createWatchlist({ name: 'Tech Stocks' });
```

**Features:**

- ✅ Order placement (LIMIT, MARKET, STOP)
- ✅ Watchlist management
- ✅ Stock data fetching
- ✅ Real-time updates

## Migration from Apollo Queries

### Before (Apollo):

```typescript
const { data, loading, refetch } = useQuery(GET_DASHBOARD);
const [placeOrder] = useMutation(PLACE_ORDER);
```

### After (Zustand):

```typescript
const { dashboard, dashboardLoading, fetchDashboard, placeOrder } =
  usePortfolioStore();
```

## Benefits of Zustand

### 1. **Performance**

- No unnecessary re-renders
- Selective subscriptions
- Optimized state updates

### 2. **Simplicity**

- Less boilerplate code
- No providers needed
- Direct store access

### 3. **Persistence**

- Automatic state persistence
- Seamless app restart experience
- Configurable storage

### 4. **TypeScript**

- Full type safety
- Better IntelliSense
- Compile-time error checking

## Usage Patterns

### 1. **Component Data Fetching**

```typescript
useEffect(() => {
  fetchDashboard();
  fetchPortfolio();
}, [fetchDashboard, fetchPortfolio]);
```

### 2. **Loading States**

```typescript
const { dashboardLoading, portfolioLoading } = usePortfolioStore();
const isLoading = dashboardLoading || portfolioLoading;
```

### 3. **Error Handling**

```typescript
const { error, clearError } = useAuthStore();

if (error) {
  Alert.alert('Error', error);
  clearError();
}
```

### 4. **Optimistic Updates**

```typescript
// Order placement with automatic refetch
await placeOrder(orderData);
// Orders are automatically refreshed
```

## Store Persistence

### AuthStore Persistence

- ✅ User data
- ✅ Authentication token
- ✅ Login state

### Other Stores

- Portfolio and trading data are fetched fresh on app start
- Only authentication state is persisted for security

## Best Practices

1. **Use stores directly in components**
2. **Fetch data in useEffect hooks**
3. **Handle loading states appropriately**
4. **Clear errors after displaying them**
5. **Use TypeScript for better development experience**

## Migration Checklist

- [x] AuthStore implemented
- [x] PortfolioStore implemented
- [x] TradingStore implemented
- [x] HomeScreen migrated
- [x] PortfolioScreen migrated
- [ ] TradingScreen migration
- [ ] OrdersScreen migration
- [ ] WatchlistScreen migration
- [ ] Other screens migration

The migration provides better performance, simpler code, and a more maintainable architecture!
