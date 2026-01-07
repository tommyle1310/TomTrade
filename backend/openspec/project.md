# Project Context

## Purpose
TomTrade is a real-time trading simulation platform backend that enables users to practice stock trading with virtual portfolios. The system provides order matching, market data streaming, portfolio management, risk monitoring, and real-time notifications through WebSocket connections.

## Tech Stack
- **Runtime**: Node.js with NestJS framework (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for user sessions and real-time data
- **API**: GraphQL with Apollo Server
- **Real-time**: Socket.IO for WebSocket connections
- **Authentication**: JWT-based auth with role-based access (USER/ADMIN)
- **Testing**: Jest for unit and e2e tests

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- PascalCase for classes, interfaces, and GraphQL types
- camelCase for variables, functions, and properties
- kebab-case for file names (e.g., `alert-rule.service.ts`)
- Use Prettier for formatting
- Explicit return types on public methods
- Comprehensive logging with emoji prefixes (✅, ❌, 🔍, 📊, 🔄)

### Architecture Patterns
- **Module Structure**: Feature-based modules (auth, order, portfolio, etc.)
- **Service Layer**: Business logic in services, thin resolvers/controllers
- **Repository Pattern**: Prisma service for database access
- **Event-Driven**: Event emitters for order matching and notifications
- **Transaction Management**: Use Prisma transactions for multi-step operations
- **Caching Strategy**: Redis cache with TTL for user data, price data cached in-memory
- **Real-time Updates**: Socket.IO gateways emit events on order fills, price updates

### Module Organization
Each module typically contains:
- `*.module.ts` - Module definition
- `*.service.ts` - Business logic
- `*.resolver.ts` - GraphQL resolvers
- `entities/` - GraphQL object types
- `dto/` - Input types and DTOs
- `enums/` - Enumerations

### Testing Strategy
- Script-based integration tests in `src/scripts/` directory
- Test scripts use `ts-node` to run scenarios (e.g., `test-market-order.script.ts`)
- Focus on end-to-end workflows: order matching, partial fills, cancellations
- Manual testing via test scripts before deployment

### Git Workflow
- Feature branches for new capabilities
- Direct commits to main for bug fixes and small changes
- Use descriptive commit messages
- Deploy to cloud-lab environment for testing

## Domain Context

### Trading System Components
- **Order Book**: In-memory order book with price-time priority matching
- **Order Types**: LIMIT, MARKET, STOP_LIMIT, STOP_MARKET
- **Time in Force**: GTC (Good Till Cancelled), IOC (Immediate or Cancel), FOK (Fill or Kill)
- **Order Sides**: BUY, SELL
- **Order Status**: OPEN, PARTIAL, FILLED, CANCELLED

### Core Entities
- **User**: Traders with balances, portfolios, watchlists, and alert rules
- **Stock**: Tradable securities with market data, price history
- **Order**: Buy/sell orders with matching engine
- **Portfolio**: User's stock holdings with quantity and average price
- **Transaction**: Historical record of executed trades
- **Balance**: User's available cash for trading
- **AlertRule**: Price alerts for stocks (above/below thresholds)
- **MarketData**: Time-series price data (OHLCV) with intervals

### Trading Rules
- Users must have sufficient balance to place buy orders
- Users must have sufficient stock quantity to place sell orders
- Orders match based on price-time priority
- Partial fills are supported for large orders
- Market orders execute at best available price
- Stop orders trigger when price crosses trigger threshold

### User Roles
- **USER**: Standard trader with portfolio and order access
- **ADMIN**: System administrator with user management capabilities

### Dashboard Metrics
- Portfolio value calculation based on current market prices
- P&L (Profit & Loss) calculation comparing current vs. average price
- Open positions count and profitability
- Account status and join date

## Important Constraints
- All prices stored as Float (double precision)
- Order matching executed within Prisma transactions
- WebSocket connections require JWT authentication
- Redis cache used for high-frequency data (prices, user sessions)
- Market data intervals: 1m, 5m, 15m, 1h, 1d
- Price updates broadcast to subscribed WebSocket clients
- Insufficient balance/stock checks before order placement

## External Dependencies
- **PostgreSQL Database**: Primary data store
- **Redis**: Session and cache store
- **Market Data Source**: External price feed (simulated for demo)
- **Frontend Clients**: React Native (mobile), Next.js (web), Flutter (mobile)
- **Docker**: Cloud-lab deployment with nginx load balancer

## API Patterns
- GraphQL queries return read-only data
- GraphQL mutations modify state (create orders, update balances)
- Use `@UseGuards(GqlAuthGuard)` for authenticated endpoints
- Use `@CurrentUser()` decorator to extract user from JWT
- Return GraphQL object types (not plain objects)
- Nullable fields use `{ nullable: true }` in decorators
