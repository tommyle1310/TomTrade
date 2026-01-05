# Internationalization (i18n) Specification

## ADDED Requirements

### Requirement: Language Support
The system SHALL support English (en) and Vietnamese (vi) languages for all user-facing text.

#### Scenario: Default language
- **WHEN** user visits the application for the first time
- **THEN** the default language SHALL be English (en)

#### Scenario: Language coverage
- **WHEN** any language is selected
- **THEN** all static UI text SHALL be displayed in the selected language

### Requirement: Language Switching
The system SHALL provide a language switcher accessible to all authenticated users.

#### Scenario: Language switcher location
- **WHEN** user is authenticated
- **THEN** a language switcher SHALL be visible in the Topbar

#### Scenario: Switch to Vietnamese
- **WHEN** user selects Vietnamese (VI) from the language switcher
- **THEN** all UI text SHALL immediately update to Vietnamese

#### Scenario: Switch to English
- **WHEN** user selects English (EN) from the language switcher
- **THEN** all UI text SHALL immediately update to English

### Requirement: Language Persistence
The system SHALL persist the user's language preference across browser sessions.

#### Scenario: Persist preference
- **WHEN** user selects a language
- **THEN** the preference SHALL be stored in localStorage

#### Scenario: Restore preference
- **WHEN** user returns to the application
- **THEN** the previously selected language SHALL be automatically applied

#### Scenario: New browser
- **WHEN** user accesses from a new browser without stored preference
- **THEN** the default language (English) SHALL be used

### Requirement: Translation Scope
The system SHALL translate the following UI elements.

#### Scenario: Navigation translation
- **WHEN** any language is active
- **THEN** all sidebar navigation items SHALL be translated

#### Scenario: Form labels translation
- **WHEN** any language is active
- **THEN** all form labels and placeholders SHALL be translated

#### Scenario: Button text translation
- **WHEN** any language is active
- **THEN** all button labels SHALL be translated

#### Scenario: Error message translation
- **WHEN** any language is active
- **THEN** all error messages and validation messages SHALL be translated

#### Scenario: Page titles translation
- **WHEN** any language is active
- **THEN** all page titles and headings SHALL be translated

### Requirement: HTML Language Attribute
The system SHALL update the HTML lang attribute based on selected language.

#### Scenario: English selected
- **WHEN** English is the active language
- **THEN** the html element SHALL have `lang="en"`

#### Scenario: Vietnamese selected
- **WHEN** Vietnamese is the active language
- **THEN** the html element SHALL have `lang="vi"`

### Requirement: Translation Type Safety
The system SHALL provide type-safe translation keys to prevent missing translations.

#### Scenario: Missing translation key
- **WHEN** a developer uses a translation key
- **THEN** TypeScript SHALL validate the key exists in all language files

#### Scenario: IDE support
- **WHEN** a developer accesses translation keys
- **THEN** the IDE SHALL provide autocomplete suggestions for valid keys

### Requirement: useTranslation Hook
The system SHALL provide a `useTranslation` hook for accessing translations in components.

#### Scenario: Access translations
- **WHEN** a component needs translated text
- **THEN** the component SHALL use `const { t } = useTranslation()`

#### Scenario: Reactive updates
- **WHEN** language is changed
- **THEN** all components using useTranslation SHALL re-render with new translations

### Requirement: Language Indicator
The system SHALL display a clear indicator of the currently selected language.

#### Scenario: Current language display
- **WHEN** language switcher is visible
- **THEN** the current language code (EN/VI) or flag SHALL be displayed

#### Scenario: Language options
- **WHEN** user opens language switcher
- **THEN** both language options SHALL be clearly distinguishable
