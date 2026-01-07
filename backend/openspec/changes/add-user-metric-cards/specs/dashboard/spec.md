# Dashboard Capability - Metric Cards

## ADDED Requirements

### Requirement: User Metric Cards Query
The system SHALL provide a GraphQL query that returns an array of metric cards summarizing the authenticated user's trading account status, portfolio value, profit/loss, and position statistics.

#### Scenario: User with active portfolio requests metric cards
- **WHEN** an authenticated user queries `getUserMetricCards`
- **THEN** the system returns an array of metric cards including:
  - Portfolio Value card with current total value and change from initial investment
  - Total P&L card with profit/loss amount and percentage
  - Open Positions card with count and profitable positions
  - Account Status card with status and join date

#### Scenario: Portfolio Value card calculation
- **WHEN** calculating the Portfolio Value metric card
- **THEN** the system:
  - Calculates total holdings value as sum of (quantity × current price) for all positions
  - Adds current cash balance to holdings value
  - Computes change as (current total - initial investment)
  - Computes change percentage as ((current total - initial) / initial) × 100
  - Returns value in dollar currency format

#### Scenario: Total P&L card calculation
- **WHEN** calculating the Total P&L metric card
- **THEN** the system:
  - Calculates unrealized P&L as sum of ((current price - average price) × quantity) for open positions
  - Includes realized P&L from closed positions if applicable
  - Computes percentage gain as (P&L / total invested) × 100
  - Includes "today" as extra data to indicate the calculation timeframe
  - Returns positive or negative dollar values

#### Scenario: Open Positions card calculation
- **WHEN** calculating the Open Positions metric card
- **THEN** the system:
  - Counts total number of active portfolio positions
  - Counts number of profitable positions (current price > average price)
  - Returns count as quantity value unit
  - Includes profitable count as extra data (e.g., "3 profitable")
  - Returns zero if user has no positions

#### Scenario: Account Status card retrieval
- **WHEN** retrieving the Account Status metric card
- **THEN** the system:
  - Returns "Active" or "Inactive" based on user account status
  - Formats join date as "Joined on MM/DD/YYYY"
  - Returns "Active" for non-banned users, "Inactive" for banned users
  - Includes join date in extra data field

#### Scenario: User with no positions requests metric cards
- **WHEN** a user with empty portfolio queries `getUserMetricCards`
- **THEN** the system returns metric cards with:
  - Portfolio Value showing only cash balance
  - Total P&L showing $0 and 0%
  - Open Positions showing 0
  - Account Status showing active with join date

#### Scenario: Authentication required for metric cards
- **WHEN** an unauthenticated request is made to `getUserMetricCards`
- **THEN** the system rejects the request with authentication error
- **AND** no metric data is returned

### Requirement: Metric Card Data Structure
The system SHALL return metric cards in a standardized format with consistent field names and data types for frontend consumption.

#### Scenario: Metric card structure validation
- **WHEN** a metric card is returned in the response
- **THEN** each card contains:
  - `title` (String, required): Display name of the metric
  - `value` (Float or String, required): Primary metric value
  - `valueUnit` (String, nullable): Unit description (e.g., "currency", "quantity")
  - `valueType` (String, nullable): Type indicator (e.g., "dollar", "number")
  - `change` (Float, nullable): Change amount or delta
  - `changeType` (String, nullable): Change unit (e.g., "dollar", "percent", "number")
  - `changeExtraData` (String, nullable): Additional context (e.g., "+5.17%", "today", "profitable")
  - `extraData` (String, nullable): Supplementary information (e.g., "Joined on 5/9/2025")

#### Scenario: Currency value formatting
- **WHEN** a metric card represents currency values
- **THEN** the system:
  - Uses `valueType: "dollar"` and `valueUnit: "currency"`
  - Returns numeric value as Float (e.g., 5180.00)
  - Includes change as numeric Float (e.g., 280.00)
  - Includes formatted percentage in `changeExtraData` (e.g., "+5.17%")

#### Scenario: Percentage change formatting
- **WHEN** a metric card represents percentage changes
- **THEN** the system:
  - Uses `changeType: "percent"`
  - Returns percentage as decimal Float (e.g., 5.71 for 5.71%)
  - Includes context in `changeExtraData` (e.g., "today", "vs. yesterday")

#### Scenario: Quantity value formatting
- **WHEN** a metric card represents countable quantities
- **THEN** the system:
  - Uses `valueUnit: "quantity"` and `changeType: "number"`
  - Returns integer count as Float (e.g., 3.0)
  - Uses `changeExtraData` for additional context (e.g., "profitable", "at risk")

#### Scenario: Status value formatting
- **WHEN** a metric card represents account status
- **THEN** the system:
  - Returns string value (e.g., "Active", "Inactive")
  - Uses `valueUnit` to describe possible values
  - Includes date or timestamp in `extraData`
  - Omits `change` and `changeType` fields (null or undefined)