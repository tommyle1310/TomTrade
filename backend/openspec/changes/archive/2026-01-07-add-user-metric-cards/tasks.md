# Implementation Tasks

## 1. Define GraphQL Types
- [x] 1.1 Create `MetricCard` entity in `src/dashboard/entities/metric-card.entity.ts`
- [x] 1.2 Define all fields: title, value, valueUnit, valueType, change, changeType, changeExtraData, extraData
- [x] 1.3 Add proper GraphQL decorators (`@ObjectType`, `@Field`)
- [x] 1.4 Export entity from entities directory

## 2. Implement Service Logic
- [x] 2.1 Add `getUserMetricCards(userId: string)` method to `DashboardService`
- [x] 2.2 Calculate Portfolio Value card (total holdings value + cash balance)
- [x] 2.3 Calculate Total P&L card (realized + unrealized P&L)
- [x] 2.4 Calculate Open Positions card (count of active positions, profitable count)
- [x] 2.5 Get Account Status card (user status, join date)
- [x] 2.6 Format all cards according to schema (handle nulls for optional fields)
- [x] 2.7 Add comprehensive logging for debugging

## 3. Add GraphQL Resolver
- [x] 3.1 Add `@Query(() => [MetricCard])` in `DashboardResolver`
- [x] 3.2 Add `getUserMetricCards()` method with `@CurrentUser()` decorator
- [x] 3.3 Add `@UseGuards(GqlAuthGuard)` for authentication
- [x] 3.4 Call service method and return formatted result
- [x] 3.5 Update generated schema.gql file

## 4. Testing
- [x] 4.1 Create test script `test-metric-cards.script.ts` in `src/scripts/`
- [x] 4.2 Test with user having positions (positive and negative P&L)
- [x] 4.3 Test with user having no positions (empty portfolio)
- [x] 4.4 Test with new user (zero balance, no history)
- [x] 4.5 Verify all fields are correctly populated
- [x] 4.6 Verify percentage calculations are accurate

## 5. Documentation
- [x] 5.1 Update GraphQL schema documentation
- [x] 5.2 Add code comments explaining calculation logic
- [x] 5.3 Update this tasks.md with completion checkmarks