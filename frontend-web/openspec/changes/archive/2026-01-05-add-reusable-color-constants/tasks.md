# Implementation Tasks

## 1. Create Theme Directory Structure
- [x] 1.1 Create `lib/theme/` directory if it doesn't exist
- [x] 1.2 Create `lib/theme/colors.ts` file
- [x] 1.3 Create `lib/theme/styles.ts` file
- [x] 1.4 Create `lib/theme/index.ts` barrel export file

## 2. Implement Color System Module
- [x] 2.1 Define color intensity scale helper (generates 400, 500, 600 variants)
- [x] 2.2 Define semantic colors with intensity levels:
  - [x] Success colors (maps to `--success`)
  - [x] Danger colors (maps to `--danger`)
  - [x] Warning colors (maps to `--warning`)
  - [x] Primary, Secondary, Accent variants
- [x] 2.3 Define entity-based colorsets:
  - [x] Global colors (background, foreground, border)
  - [x] Text colors (primary, secondary, muted, disabled)
  - [x] Brand colors (primary brand identity)
  - [x] Secondary brand colors
  - [x] State colors (hover, active, focus, disabled)
  - [x] Button colors (default, hover, active, disabled per variant)
  - [x] Input/Form colors (border, background, focus, error)
  - [x] Card colors (background, border, header)
  - [x] Table colors (header, row, hover, border)
  - [x] Notification colors (info, success, warning, error)
  - [x] Modal colors (overlay, background, border)
  - [x] Icon colors (primary, secondary, muted)
  - [x] Utility colors (divider, overlay, skeleton)
- [x] 2.4 Export trading-specific constants (`GAIN_COLOR`, `LOSS_COLOR`, `CHART_COLORS`)
- [x] 2.5 Add comprehensive JSDoc comments for each colorset

## 3. Implement CSS Utilities Module
- [x] 3.1 Define border radius constants:
  - [x] `ROUNDED_NONE`, `ROUNDED_SM`, `ROUNDED_MD`, `ROUNDED_LG`, `ROUNDED_XL`, `ROUNDED_FULL`
- [x] 3.2 Define shadow utilities:
  - [x] `SHADOW_NONE`, `SHADOW_SM`, `SHADOW_MD`, `SHADOW_LG`, `SHADOW_XL`, `SHADOW_INNER`
- [x] 3.3 Define gradient helpers:
  - [x] Linear gradient generator function
  - [x] Common gradient presets (success, danger, brand)
- [x] 3.4 Define typography constants:
  - [x] Font family constants (sans, mono)
  - [x] Font size scale (xs, sm, base, lg, xl, 2xl, etc.)
  - [x] Font weight constants (light, normal, medium, semibold, bold)
  - [x] Line height scale
- [x] 3.5 Define spacing/sizing utilities:
  - [x] Common size constants (button heights, input heights)
  - [x] Icon size presets (xs, sm, md, lg, xl)
  - [x] Container width constants
- [x] 3.6 Add JSDoc comments for all utilities

## 4. Update Chart Components
- [x] 4.1 Replace hardcoded colors in `VolumeChart.tsx` with color constants
- [x] 4.2 Replace hardcoded colors in `app/charts/page.tsx` (candlestick gradients, strokes)
- [x] 4.3 Replace hardcoded colors in `app/indicators/page.tsx` (line charts, area fills)
- [x] 4.4 Replace inline shadow/rounded values with style constants where applicable

## 5. Search and Update Remaining Components
- [x] 5.1 Search codebase for hardcoded hex colors (`#10b981`, `#ef4444`, `#3b82f6`, etc.)
- [x] 5.2 Search for inline Tailwind shadow classes that could use constants
- [x] 5.3 Search for repeated rounded/sizing patterns
- [x] 5.4 Update components to use theme constants where applicable

## 6. Testing and Validation
- [x] 6.1 Verify all charts render correctly with new colors
- [x] 6.2 Test light/dark theme switching to ensure colors adapt properly
- [x] 6.3 Verify entity colorsets work across different component types
- [x] 6.4 Test color intensity levels provide appropriate visual hierarchy
- [x] 6.5 Confirm style utilities produce consistent visual results
- [x] 6.6 Validate color consistency across dashboard, charts, and indicators pages

## 7. Documentation
- [x] 7.1 Add usage examples in JSDoc comments
- [x] 7.2 Document color intensity scale usage
- [x] 7.3 Document entity colorset guidelines
- [x] 7.4 Add migration guide for existing components
