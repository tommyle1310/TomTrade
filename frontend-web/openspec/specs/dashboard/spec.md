# dashboard Specification

## Purpose
TBD - created by archiving change integrate-user-metric-cards. Update Purpose after archive.
## Requirements
### Requirement: User Metric Cards Data Fetching
The system SHALL fetch user metric cards from the backend GraphQL API and display them on the user dashboard with proper loading and error states.

#### Scenario: Successful metric cards fetch
- **WHEN** an authenticated user navigates to the dashboard
- **THEN** the system fetches metric cards via `getUserMetricCards` GraphQL query
- **AND** displays 4 metric cards: Portfolio Value, Total P&L, Open Positions, Account Status
- **AND** shows loading indicators while fetching
- **AND** displays accurate data matching backend calculations

#### Scenario: Metric cards loading state
- **WHEN** the dashboard is loading metric cards data
- **THEN** the system displays loading skeletons or spinners in the metric cards area
- **AND** does not show stale or mock data
- **AND** maintains layout structure during loading

#### Scenario: Metric cards error handling
- **WHEN** the metric cards API call fails (network error or backend unavailable)
- **THEN** the system displays an error message or fallback UI
- **AND** provides a retry mechanism or helpful error text
- **AND** does not crash or show empty cards without explanation

#### Scenario: Real-time data display
- **WHEN** metric cards data is successfully fetched
- **THEN** Portfolio Value card shows total assets with change percentage
- **AND** Total P&L card shows profit/loss with percentage
- **AND** Open Positions card shows count with profitable positions count
- **AND** Account Status card shows Active/Inactive with join date
- **AND** all values are formatted correctly (currency, percentages, dates)

#### Scenario: Data refresh on dashboard revisit
- **WHEN** user navigates away from dashboard and returns
- **THEN** the system refetches metric cards data
- **AND** displays updated values reflecting latest portfolio state
- **AND** maintains cache for performance when appropriate

### Requirement: GraphQL Query Integration
The system SHALL provide a GraphQL query function and TanStack Query hook for fetching user metric cards with proper TypeScript typing.

#### Scenario: GraphQL query definition
- **WHEN** the query file is imported
- **THEN** it exports a `getUserMetricCards` query string
- **AND** the query matches the backend GraphQL schema
- **AND** includes all MetricCard fields (title, value, valueUnit, valueType, change, changeType, changeExtraData, extraData)

#### Scenario: TanStack Query hook usage
- **WHEN** a component calls `useUserMetricCards()` hook
- **THEN** the hook returns data, loading, and error states
- **AND** automatically includes authentication token in request
- **AND** properly types the response as `MetricCard[]`
- **AND** provides cache management with appropriate stale time

#### Scenario: Type safety for metric cards
- **WHEN** working with metric card data in TypeScript
- **THEN** all fields are properly typed matching backend schema
- **AND** optional fields are marked as nullable
- **AND** IDE provides autocomplete for all fields
- **AND** compile-time errors catch mismatched field access

### Requirement: Mock Data Removal
The system SHALL remove all hardcoded mock data from the UserDashboard component and replace with API-fetched data.

#### Scenario: No mock data in production
- **WHEN** the dashboard renders
- **THEN** no mock portfolio items are used
- **AND** no mock calculations are performed
- **AND** all data comes from backend API
- **AND** component only uses fetched data for display

#### Scenario: Clean component structure
- **WHEN** reviewing UserDashboard component code
- **THEN** no `mockPortfolio` or similar constants exist
- **AND** no hardcoded calculations for PnL or values
- **AND** all metric logic is handled by backend
- **AND** component focuses on presentation and state management

### Requirement: UI State Management
The system SHALL maintain existing UI animations, styling, and responsive layout while integrating real data.

#### Scenario: Preserve animations with real data
- **WHEN** metric cards render with fetched data
- **THEN** Framer Motion animations still apply (stagger, fade-in)
- **AND** hover effects and transitions work correctly
- **AND** responsive grid layout adjusts properly
- **AND** card styling matches design system

#### Scenario: Consistent number formatting
- **WHEN** displaying metric card values
- **THEN** currency values show dollar sign and proper decimals
- **AND** percentages show % symbol and proper precision
- **AND** large numbers use locale-appropriate thousands separators
- **AND** dates show in user-friendly format (e.g., "1/7/2026")

#### Scenario: Color coding for positive/negative values
- **WHEN** displaying P&L and change values
- **THEN** positive values show in success color (green)
- **AND** negative values show in danger color (red)
- **AND** icons match the sentiment (TrendingUp/TrendingDown)
- **AND** neutral values show in default color

