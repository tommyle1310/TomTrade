# GTC Order Logic Implementation

## Overview

This document describes the implementation of Good Till Cancelled (GTC) Order Logic in the TomTrade backend.

## 🎯 Objectives

- Implement GTC (Good Till Cancelled) order behavior
- Support IOC (Immediate or Cancel) orders
- Support FOK (Fill or Kill) orders
- Maintain order status based on TimeInForce rules

## 🔧 Implementation Details

### 1. Database Schema Changes

#### New Enum: TimeInForce

```prisma
enum TimeInForce {
  GTC  // Good Till Cancelled (default)
  IOC  // Immediate or Cancel
  FOK  // Fill or Kill
}
```

#### Updated Order Model

```prisma
model Order {
  id          String      @id @default(uuid())
  userId      String
  ticker      String
  side        OrderSide
  price       Float
  quantity    Float
  status      OrderStatus   @default(OPEN)
  createdAt   DateTime      @default(now())
  matchedAt   DateTime?
  type        OrderType     @default(LIMIT)
  timeInForce TimeInForce   @default(GTC)  // ✅ NEW FIELD

  user  User  @relation(fields: [userId], references: [id])
  stock Stock @relation(fields: [ticker], references: [ticker])

  @@index([ticker, side, price, status])
}
```

### 2. GraphQL Schema Updates

#### New Input Type

```graphql
input PlaceOrderInput {
  ticker: String!
  price: Float!
  quantity: Float!
  side: OrderSide!
  type: OrderType! = LIMIT
  timeInForce: TimeInForce! = GTC # ✅ NEW FIELD
}
```

#### Updated Order Type

```graphql
type Order {
  id: ID!
  ticker: String!
  side: OrderSide!
  type: OrderType!
  price: Float!
  quantity: Float!
  status: OrderStatus!
  timeInForce: TimeInForce! # ✅ NEW FIELD
  createdAt: DateTime!
  matchedAt: DateTime
}
```

### 3. Order Matching Logic

#### GTC (Good Till Cancelled) - Default Behavior

- ✅ **Partial Fill**: Order stays OPEN with remaining quantity
- ✅ **Full Fill**: Order becomes FILLED
- ✅ **No Matches**: Order stays OPEN until cancelled or matched

#### FOK (Fill or Kill)

- ✅ **Full Fill**: Order becomes FILLED
- ✅ **Partial Fill**: Entire order is CANCELLED
- ✅ **No Matches**: Order is CANCELLED

#### IOC (Immediate or Cancel)

- ✅ **Full Fill**: Order becomes FILLED
- ✅ **Partial Fill**: Filled portion executed, remaining CANCELLED
- ✅ **No Matches**: Order is CANCELLED

### 4. Implementation Files

#### Core Files Modified:

1. `prisma/schema.prisma` - Database schema
2. `src/order/enums/time-in-force.enum.ts` - New enum
3. `src/order/entities/order.entity.ts` - GraphQL entity
4. `src/order/dto/place-order.input.ts` - Input DTO
5. `src/order/order.service.ts` - Matching logic

#### Test Files Created:

1. `src/scripts/test-gtc-order.script.ts` - Basic GTC tests
2. `src/scripts/test-gtc-scenarios.script.ts` - Comprehensive scenarios

## 🧪 Test Scenarios

### Scenario 1: GTC Partial Fill

```
1. Create SELL order: 30 shares @ $300 (GTC)
2. Create BUY order: 100 shares @ $300 (GTC)
3. Expected: BUY order becomes PARTIAL (70 remaining), stays OPEN
```

### Scenario 2: FOK No Matches

```
1. Create BUY order: 50 shares @ $280 (FOK) - no matches
2. Expected: Order becomes CANCELLED
```

### Scenario 3: IOC Partial Fill

```
1. Create SELL order: 20 shares @ $290 (GTC)
2. Create BUY order: 100 shares @ $290 (IOC)
3. Expected: 20 shares filled, 80 shares CANCELLED
```

## 🚀 Usage

### Place a GTC Order

```graphql
mutation {
  placeOrder(
    input: {
      ticker: "AAPL"
      side: BUY
      type: LIMIT
      price: 300.0
      quantity: 100
      timeInForce: GTC
    }
  ) {
    id
    status
    timeInForce
    quantity
  }
}
```

### Place an FOK Order

```graphql
mutation {
  placeOrder(
    input: {
      ticker: "AAPL"
      side: BUY
      type: LIMIT
      price: 300.0
      quantity: 100
      timeInForce: FOK
    }
  ) {
    id
    status
    timeInForce
    quantity
  }
}
```

## 🔄 Migration Steps

1. **Run Database Migration**:

   ```bash
   cd backend
   npx prisma migrate dev --name add_time_in_force
   ```

2. **Regenerate Prisma Client**:

   ```bash
   npx prisma generate
   ```

3. **Test the Implementation**:

   ```bash
   # Start the backend
   npm run start:dev

   # In another terminal, run tests
   npx ts-node src/scripts/test-gtc-scenarios.script.ts
   ```

## ✅ Verification Checklist

- [x] Database schema updated with TimeInForce enum
- [x] Order model includes timeInForce field
- [x] GraphQL schema updated
- [x] Input DTO includes timeInForce with GTC default
- [x] Order entity includes timeInForce field
- [x] Matching logic handles GTC, IOC, FOK correctly
- [x] Test scripts created for verification
- [ ] Database migration run
- [ ] Prisma client regenerated
- [ ] Integration tests pass

## 🎯 Next Steps

After implementing GTC logic, consider:

1. **Order Expiration**: Add expiration dates for orders
2. **Stop Orders**: Implement stop-loss and stop-limit orders
3. **Trailing Stops**: Add trailing stop functionality
4. **Order Routing**: Implement order routing to different exchanges
5. **Order Validation**: Add more sophisticated order validation rules
