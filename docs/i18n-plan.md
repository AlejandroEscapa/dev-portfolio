# Internationalization (i18n) Implementation Plan

## 1. Objective
The goal is to decouple all user-facing strings from the React components and move them into a centralized translation resource system. This will enable future multi-language support (e.g., Spanish) without altering the application's look and feel or performance.

## 2. Technical Strategy

### 2.1 Translation Format: JSON
**Decision**: JSON files will be used for translation resources.
**Justification**: 
- **Performance**: JSON is natively parsed by the browser's JS engine (extremely fast).
- **Stability**: It is the industry standard for i18n, ensuring compatibility with almost all toolsets.
- **Maintainability**: Easy to read, edit, and integrate with translation management systems (TMS) if the project scales.

### 2.2 Implementation Tooling
**Recommended Library**: `react-i18next` & `i18next`
**Justification**: 
- Standard for React applications.
- Provides the `useTranslation` hook for efficient component-level access.
- Minimal overhead and highly optimized for production builds.

## 3. Execution Roadmap

### Phase 1: Analysis & Inventory (Audit)
- **Scanning**: Perform a comprehensive audit of the following directories:
  - `src/pages/Index.tsx`
  - `src/components/sections/`
  - `src/components/`
- **Mapping**: Extract every hardcoded string and assign a unique, semantic key.
  - *Example*: `"About Me"` $\rightarrow$ `sections.about.title`
- **Inventory Document**: Create a temporary mapping file to track all identified strings to ensure 100% coverage.

### Phase 2: Infrastructure Setup
- **Dependency Installation**: Install `i18next` and `react-i18next`.
- **Configuration**: 
  - Create `src/i18n/config.ts` to initialize the i18n instance.
  - Define the default language (`en`).
- **Resource Structure**: 
  - `/src/i18n/locales/en/translation.json` (Source of truth).
  - Organize JSON structure by page section to avoid key collisions.

### Phase 3: Systematic Extraction & Refactoring
- **Component Update**: Replace hardcoded strings with the `t()` function from the `useTranslation` hook.
- **Workflow**:
  1. Read the component.
  2. Identify the string.
  3. Add string to `translation.json` with its key.
  4. Replace string in code: `<span>{t('key')}</span>`.
- **Preservation**: Ensure no HTML tags or CSS classes are accidentally moved into the JSON file to maintain the exact look and feel.

### Phase 4: Validation & Quality Assurance
- **Visual Regression**: Verify that the layout remains identical after replacement.
- **Type Safety**: Implement a TypeScript definition for translation keys to prevent "missing key" errors during development.
- **Linting**: Run `npm run lint` to ensure no regressions were introduced.

## 4. Performance Considerations
- **Lazy Loading**: For future expansion, translation files can be loaded on demand via `i18next-http-backend` to keep the initial bundle size small.
- **Memoization**: Ensure that the translation hook is used correctly to avoid unnecessary re-renders.
