# Change: Add Reusable Color Constants

## Why
Currently, chart components and UI elements use hardcoded color values (e.g., `#10b981`, `#ef4444`) directly in their JSX, leading to:
- **Inconsistency**: Different components may use different shades for the same semantic meaning (e.g., "gain" colors)
- **Maintenance burden**: Updating colors requires finding and changing multiple hardcoded values across files
- **Theme integration gap**: Hardcoded hex values don't respect the CSS custom properties already defined in `globals.css`
- **Dashboard sync issues**: Colors in charts don't automatically match the dashboard theme

## What Changes
- Create a comprehensive design system with two main modules:
  - **Color System** (`lib/theme/colors.ts`):
    - Color intensity levels (e.g., `success-400`, `success-500`, `success-600`) for fine-grained control
    - Entity-based colorsets for specific UI components: `global`, `text`, `brand`, `secondary`, `state`, `btn`, `input`, `form`, `card`, `table`, `notification`, `modal`, `icon`, `utility`
    - Semantic color constants for trading-specific use cases: `GAIN_COLOR`, `LOSS_COLOR`, `NEUTRAL_COLOR`, `CHART_COLORS`
  - **CSS Utilities** (`lib/theme/styles.ts`):
    - Border radius constants (`ROUNDED_SM`, `ROUNDED_MD`, `ROUNDED_LG`, etc.)
    - Shadow utilities (`SHADOW_SM`, `SHADOW_MD`, `SHADOW_LG`, etc.)
    - Linear gradient helpers
    - Typography constants (font families, sizes, weights)
    - Spacing/size utilities
- Update all components with hardcoded color values to use the new constants
- Ensure colors reference the existing CSS custom properties for theme consistency

## Impact
- Affected specs: `ui-design`
- Affected code:
  - `app/charts/components/VolumeChart.tsx` (hardcoded `#10b981`, `#ef4444`)
  - `app/charts/page.tsx` (multiple gradient and stroke colors)
  - `app/indicators/page.tsx` (hardcoded chart colors)
  - Any components with inline color, shadow, or style values
  - Any components using hardcoded Tailwind classes that could use constants
- New files:
  - `lib/theme/colors.ts` - Color system with intensity levels and entity colorsets
  - `lib/theme/styles.ts` - CSS utilities (rounded, shadow, gradients, typography, sizing)
  - `lib/theme/index.ts` - Barrel export for easy imports
