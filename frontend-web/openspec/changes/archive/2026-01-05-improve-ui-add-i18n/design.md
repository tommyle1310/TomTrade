# Design: Improve UI Design & Add Internationalization

## Context
TomTrade is a trading platform web application built with Next.js 15, shadcn/ui, and Tailwind CSS. The current UI uses default shadcn styling which appears generic. The platform needs to support Vietnamese users alongside English speakers.

**Stakeholders**: End users (traders), System admins, Product team

**Constraints**:
- Must maintain shadcn/ui component compatibility
- Cannot introduce breaking changes to existing functionality
- Must support both light/dark modes
- Performance impact must be minimal

## Goals / Non-Goals

### Goals
- Create a polished, professional trading platform aesthetic
- Support seamless language switching between EN and VI
- Maintain consistent design language across all components
- Improve perceived performance with loading states and transitions
- Make the UI feel "hand-crafted" rather than template-generated

### Non-Goals
- Complete UI redesign or brand overhaul
- Supporting additional languages beyond EN/VI in this iteration
- Adding complex animation libraries beyond Framer Motion
- Server-side rendering for translations (client-side only)

## Decisions

### Decision 1: Client-side i18n with Zustand
**What**: Use Zustand store for language state instead of next-intl or react-i18next
**Why**: 
- Consistent with existing state management pattern (authStore uses Zustand)
- Simpler implementation without additional dependencies
- No need for SSR i18n complexity for this use case
- Lightweight and fast

**Alternatives considered**:
- next-intl: More features but adds complexity and routing changes
- react-i18next: Industry standard but overkill for 2 languages
- React Context only: Would work but Zustand provides persistence

### Decision 2: Translation File Structure
**What**: TypeScript files with typed translation objects
```
lib/translations/
├── en.ts       # English translations
├── vi.ts       # Vietnamese translations
└── index.ts    # Type definitions and useTranslation hook
```
**Why**:
- Type safety for translation keys
- IDE autocomplete for translation keys
- Compile-time errors for missing translations
- No JSON parsing overhead

### Decision 3: UI Enhancement Approach
**What**: Incremental improvements to existing components rather than new component library
**Why**:
- Maintains familiarity for existing codebase
- Lower risk of breaking existing functionality
- Faster implementation
- Keeps bundle size minimal

### Decision 4: Motion/Animation Strategy
**What**: Create shared motion variants in `lib/motionVariants.ts`
**Why**:
- Consistent animation timing across components
- Easy to adjust globally
- Reduces code duplication
- Better performance with shared animation configs

### Decision 5: Color Palette Enhancement
**What**: Extend existing CSS variables with trading-specific colors
```css
--success: /* green for gains */
--danger: /* red for losses */
--glass-bg: /* glassmorphism background */
--glass-border: /* glassmorphism border */
```
**Why**:
- Trading platforms have established color conventions (green=up, red=down)
- CSS variables integrate with existing Tailwind setup
- Easy theme switching support
- Consistent with shadcn/ui patterns

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Translation coverage gaps | Create comprehensive translation checklist, test both languages |
| Motion performance on low-end devices | Use `prefers-reduced-motion` media query |
| Breaking existing styles | Incremental changes with visual regression testing |
| Bundle size increase | Monitor with next build analyzer, lazy load translations if needed |

## Migration Plan

### Phase 1: Infrastructure (Non-breaking)
1. Add i18n store and translation files
2. Add I18nProvider without affecting existing components
3. Add motion variants file

### Phase 2: UI Enhancements (Visual only)
1. Update CSS variables
2. Enhance component styles incrementally
3. Add micro-interactions

### Phase 3: Translation Integration
1. Add language switcher to Topbar
2. Translate layout components
3. Translate page content progressively

### Rollback
- All changes are additive; removing I18nProvider reverts to English
- CSS variable additions don't break existing styles
- Motion variants are opt-in per component

## Open Questions
- [ ] Should we persist language preference to user profile in backend?
- [ ] Do we need RTL support for future languages?
- [ ] Should admin and user interfaces have different accent colors?
