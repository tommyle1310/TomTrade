# ui-design Specification

## Purpose
TBD - created by archiving change improve-ui-add-i18n. Update Purpose after archive.
## Requirements
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

### Requirement: Micro-interactions
The system SHALL provide smooth micro-interactions on interactive elements using Framer Motion.

#### Scenario: Button hover feedback
- **WHEN** user hovers over a button
- **THEN** the button SHALL animate with a subtle scale or background transition

#### Scenario: Navigation item feedback
- **WHEN** user hovers over a sidebar navigation item
- **THEN** the item SHALL animate with smooth background and border transitions

#### Scenario: Card hover effect
- **WHEN** user hovers over an interactive card
- **THEN** the card SHALL animate with subtle elevation or shadow changes

### Requirement: Loading States
The system SHALL provide skeleton loading states for content areas during data fetching.

#### Scenario: Dashboard loading
- **WHEN** dashboard data is being fetched
- **THEN** skeleton placeholders SHALL be displayed matching the layout structure

#### Scenario: Table loading
- **WHEN** table data is being loaded
- **THEN** skeleton rows SHALL be displayed with appropriate column widths

### Requirement: Glassmorphism Design Elements
The system SHALL support glassmorphism styling for cards and overlays where appropriate.

#### Scenario: Modal backdrop
- **WHEN** a modal dialog is displayed
- **THEN** the modal MAY use glassmorphism effect for visual depth

#### Scenario: Sidebar appearance
- **WHEN** the sidebar is rendered
- **THEN** the sidebar MAY use subtle glass effect in appropriate contexts

### Requirement: Typography Hierarchy
The system SHALL maintain consistent typography hierarchy across all pages.

#### Scenario: Page titles
- **WHEN** a page is rendered
- **THEN** the page title SHALL use consistent heading styles (size, weight, spacing)

#### Scenario: Section headers
- **WHEN** content sections are displayed
- **THEN** section headers SHALL follow established hierarchy below page titles

### Requirement: Shared Motion Variants
The system SHALL provide reusable motion variants for consistent animations.

#### Scenario: Fade in animation
- **WHEN** content enters the viewport
- **THEN** the content MAY use standardized fadeIn variant

#### Scenario: Slide animation
- **WHEN** elements slide into view
- **THEN** the elements SHALL use consistent duration and easing

### Requirement: Form Input Enhancement
The system SHALL provide enhanced form inputs with improved visual feedback.

#### Scenario: Input focus state
- **WHEN** user focuses on an input field
- **THEN** the input SHALL display clear focus ring with brand color

#### Scenario: Input error state
- **WHEN** an input has validation error
- **THEN** the input SHALL display error styling with destructive color

#### Scenario: Input disabled state
- **WHEN** an input is disabled
- **THEN** the input SHALL display muted styling indicating non-interactivity

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

