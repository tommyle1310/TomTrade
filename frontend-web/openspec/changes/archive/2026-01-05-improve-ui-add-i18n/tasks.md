# Tasks: Improve UI Design & Add Internationalization

## 1. Internationalization Infrastructure
- [x] 1.1 Create `lib/i18nStore.ts` with Zustand store for language state (locale, setLocale)
- [x] 1.2 Create `lib/translations/en.ts` with English translations
- [x] 1.3 Create `lib/translations/vi.ts` with Vietnamese translations
- [x] 1.4 Create `lib/translations/index.ts` to export translation utilities and `useTranslation` hook
- [x] 1.5 Create `components/providers/I18nProvider.tsx` for context provider
- [x] 1.6 Update `app/layout.tsx` to include I18nProvider and dynamic html lang attribute

## 2. Language Switcher Component
- [x] 2.1 Create `components/ui/language-switcher.tsx` with EN/VI toggle using shadcn Select
- [x] 2.2 Add language switcher to `components/layout/Topbar.tsx`
- [x] 2.3 Add appropriate flag icons or language indicators

## 3. UI Design System Improvements
- [x] 3.1 Update `app/globals.css` with enhanced color palette (trading-specific greens/reds)
- [x] 3.2 Add CSS variables for glassmorphism effects and improved shadows
- [x] 3.3 Create motion variants file `lib/motionVariants.ts` for consistent animations
- [x] 3.4 Update button component with improved hover/active states and micro-interactions

## 4. Layout Component Refinements
- [x] 4.1 Update `components/layout/Sidebar.tsx` with improved styling, hover effects, and active states
- [x] 4.2 Update `components/layout/Topbar.tsx` with refined visual design
- [x] 4.3 Update `components/user/UserSidebar.tsx` with consistent styling
- [x] 4.4 Add smooth transitions to `components/layout/AppShell.tsx`

## 5. Translate Core Components
- [x] 5.1 Translate Sidebar navigation items
- [x] 5.2 Translate Topbar elements (login/signup forms, user menu)
- [x] 5.3 Translate UserSidebar navigation items
- [x] 5.4 Translate common UI elements (buttons, labels, error messages)

## 6. Translate Page Content
- [x] 6.1 Translate Dashboard page content (UserDashboard component)
- [x] 6.2 Translate Admin pages (users, transaction-logs, order-logs, stocks)
- [x] 6.3 Translate User pages (portfolio, history, charts, indicators)
- [x] 6.4 Translate form validation messages (in auth forms)

## 7. Testing & Validation
- [x] 7.1 Test language switching persists across page refreshes (Zustand persist middleware)
- [x] 7.2 Verify all visible text is translated in both languages
- [x] 7.3 Test UI improvements across different screen sizes
- [x] 7.4 Validate accessibility of language switcher
