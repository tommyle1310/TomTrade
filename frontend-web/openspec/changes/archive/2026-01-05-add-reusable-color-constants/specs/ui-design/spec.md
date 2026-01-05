# ui-design Spec Deltas

## ADDED Requirements

### Requirement: Centralized Color Constants
The system SHALL provide a centralized color constants module that maps semantic color names to theme CSS variables.

#### Scenario: Component uses gain color
- **WHEN** a component needs to display a positive gain or increase
- **THEN** the component SHALL use the `GAIN_COLOR` constant which maps to `--success`

#### Scenario: Component uses loss color
- **WHEN** a component needs to display a negative loss or decrease
- **THEN** the component SHALL use the `LOSS_COLOR` constant which maps to `--danger`

#### Scenario: Chart requires color palette
- **WHEN** a chart component needs multiple distinct colors for data visualization
- **THEN** the component SHALL use the `CHART_COLORS` array which references chart CSS variables

#### Scenario: Theme switching
- **WHEN** a user switches between light and dark themes
- **THEN** all color constants SHALL automatically reflect the theme-appropriate values without code changes

### Requirement: Color Intensity Levels
The system SHALL provide color intensity levels (e.g., 400, 500, 600) for semantic colors to allow fine-grained visual hierarchy control.

#### Scenario: Subtle background variant
- **WHEN** a component needs a lighter variant of a semantic color
- **THEN** the component SHALL use the 400-level variant (e.g., `success-400`)

#### Scenario: Standard color usage
- **WHEN** a component uses the default semantic color
- **THEN** the component SHALL use the 500-level variant (e.g., `success-500`)

#### Scenario: Emphasized color usage
- **WHEN** a component needs a darker/bolder variant for emphasis
- **THEN** the component SHALL use the 600-level variant (e.g., `success-600`)

#### Scenario: Hover state darkening
- **WHEN** a button with success color is hovered
- **THEN** the button MAY transition from `success-500` to `success-600`

### Requirement: Entity-Based Colorsets
The system SHALL provide entity-based colorsets for specific UI component types to ensure consistent styling patterns.

#### Scenario: Button styling
- **WHEN** a button component is rendered
- **THEN** the button SHALL use colors from the `btn` colorset (default, hover, active, disabled states)

#### Scenario: Input field styling
- **WHEN** an input field is rendered
- **THEN** the input SHALL use colors from the `input` colorset (border, background, focus, error states)

#### Scenario: Card component styling
- **WHEN** a card component is rendered
- **THEN** the card SHALL use colors from the `card` colorset (background, border, header)

#### Scenario: Table styling
- **WHEN** a table is rendered
- **THEN** the table SHALL use colors from the `table` colorset (header, row, hover, border)

#### Scenario: Notification styling
- **WHEN** a notification is displayed
- **THEN** the notification SHALL use colors from the `notification` colorset based on its type (info, success, warning, error)

#### Scenario: Modal styling
- **WHEN** a modal dialog is displayed
- **THEN** the modal SHALL use colors from the `modal` colorset (overlay, background, border)

### Requirement: CSS Utilities Module
The system SHALL provide a separate CSS utilities module for common styling constants including border radius, shadows, gradients, typography, and sizing.

#### Scenario: Consistent border radius
- **WHEN** a component needs rounded corners
- **THEN** the component SHALL use constants from `ROUNDED_*` scale (ROUNDED_SM, ROUNDED_MD, ROUNDED_LG, etc.)

#### Scenario: Consistent shadows
- **WHEN** a component needs elevation via shadow
- **THEN** the component SHALL use constants from `SHADOW_*` scale (SHADOW_SM, SHADOW_MD, SHADOW_LG, etc.)

#### Scenario: Gradient backgrounds
- **WHEN** a component needs a gradient background
- **THEN** the component SHALL use the gradient helper functions with semantic color inputs

#### Scenario: Typography consistency
- **WHEN** text needs specific styling
- **THEN** the component SHALL use typography constants (font size, weight, family, line height)

#### Scenario: Icon sizing
- **WHEN** an icon is rendered
- **THEN** the icon SHALL use size constants from the icon size presets (xs, sm, md, lg, xl)

## MODIFIED Requirements

### Requirement: Enhanced Color Palette
The system SHALL provide a trading-specific color palette with semantic colors for gains (green), losses (red), and neutral states, accessible via centralized constants that reference CSS custom properties.

#### Scenario: Display profit indicator
- **WHEN** a value represents a positive gain
- **THEN** the value SHALL be displayed using the `GAIN_COLOR` constant (maps to `--success`)

#### Scenario: Display loss indicator
- **WHEN** a value represents a negative loss
- **THEN** the value SHALL be displayed using the `LOSS_COLOR` constant (maps to `--danger`)

#### Scenario: Theme consistency
- **WHEN** the user switches between light and dark modes
- **THEN** all semantic colors SHALL maintain appropriate contrast ratios through CSS custom property references
