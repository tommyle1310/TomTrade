# Change: Improve UI Design & Add Internationalization (EN/VI)

## Why
The current UI has a generic, template-like appearance that lacks visual personality and professional polish. Additionally, the platform only supports English, limiting accessibility for Vietnamese-speaking users who are a key target audience for TomTrade.

## What Changes

### UI Design Improvements
- Refine color palette with better contrast and trading-specific accent colors (green/red for gains/losses)
- Add subtle micro-interactions and transitions using Framer Motion
- Improve typography hierarchy and spacing consistency
- Enhance card shadows, borders, and visual depth
- Add loading skeletons and smooth state transitions
- Refine sidebar and navigation hover states
- Improve form inputs and button visual feedback
- Add glassmorphism/modern design elements where appropriate

### Internationalization (i18n)
- Implement language switching between English (en) and Vietnamese (vi)
- Add language toggle in Topbar accessible to all authenticated users
- Store user's language preference in localStorage with Zustand
- Create translation files structure for scalable localization
- Translate all static UI text including navigation, buttons, labels, form messages, and error states

## Impact
- **Affected specs**: ui-design (new), internationalization (new)
- **Affected code**:
  - `components/layout/` - Sidebar, Topbar, AppShell styling and i18n
  - `components/ui/` - Base component styling refinements
  - `app/globals.css` - Enhanced CSS variables and theme
  - `lib/` - New i18n store and translation utilities
  - `components/providers/` - New I18nProvider
  - All components with static text - i18n integration
