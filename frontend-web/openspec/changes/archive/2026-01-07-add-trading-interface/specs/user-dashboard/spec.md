## ADDED Requirements

### Requirement: Dashboard Buy/Sell Button Actions
The dashboard header SHALL provide Buy and Sell buttons that open the Quick Trade Modal for order placement.

#### Scenario: User clicks Buy button in dashboard
- **WHEN** user clicks the "Buy" button in the dashboard header
- **THEN** the system opens the Quick Trade Modal
- **AND** pre-selects side as "BUY"
- **AND** focuses the ticker input field for immediate entry

#### Scenario: User clicks Sell button in dashboard
- **WHEN** user clicks the "Sell" button in the dashboard header
- **THEN** the system opens the Quick Trade Modal
- **AND** pre-selects side as "SELL"
- **AND** focuses the ticker input field for immediate entry

#### Scenario: User clicks Buy/Sell from holdings section
- **WHEN** user clicks the Plus (Buy) or Minus (Sell) icon next to a holding (e.g., "AAPL")
- **THEN** the system opens the Quick Trade Modal
- **AND** pre-fills ticker field with the holding's symbol "AAPL"
- **AND** pre-selects side based on button clicked
- **AND** focuses the quantity input field
