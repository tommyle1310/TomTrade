# Change: Add User Metric Cards API

## Why
The frontend applications (web and mobile) need a simple, structured API to display key trading metrics in card format on the user dashboard. Currently, the dashboard API returns complex nested data, but the UI needs a standardized metric card format with values, changes, and extra metadata for quick display.

## What Changes
- Add a new GraphQL query `getUserMetricCards` that returns an array of metric cards
- Each metric card contains: title, value, valueUnit, valueType, change, changeType, changeExtraData, and extraData
- Metrics include: Portfolio Value, Total P&L, Open Positions count, and Account Status
- Leverage existing dashboard calculations (portfolio value, P&L) and user data
- Returns formatted data ready for UI consumption without frontend calculations

## Impact
- Affected specs: `dashboard` (new capability)
- Affected code:
  - `src/dashboard/dashboard.service.ts` - Add `getUserMetricCards()` method
  - `src/dashboard/dashboard.resolver.ts` - Add query resolver
  - `src/dashboard/entities/` - Add `MetricCard` GraphQL entity
  - `src/dashboard/dto/` - Add DTOs if needed for complex types
- No breaking changes
- No database schema changes required (uses existing data)