PROMPT START

Context
This is a single-page portfolio built with Vite + React 18 + TypeScript + Tailwind v3 + shadcn/ui (Radix). The page is currently English-only. The navigation header contains anchor links (Hero, About, TechStack, Experience, Projects, Education). 

All English strings have already been extracted and compiled into a dedicated file located at `src/i18n/translations.ts`. However, the UI components may still contain hardcoded English copy that needs to be wired up.

Objective
Implement a client-side EN/ES language toggle without any external i18n library (no react-i18next, no i18next). Use a lightweight custom context + hook pattern. The toggle button must trigger an action that updates the state, causing the web app to extract and display the Spanish strings instead of the English ones.

Deliverables — Ordered Task List

Task 0 — Pre-Implementation Codebase Audit
Before beginning the tasks below, briefly inspect the repository to check if any modifications have been made to the app (regarding i18n structure, component layouts, or hooks) other than the creation of the `translations.ts` file. This is a precautionary check to ensure the plan's flow will work seamlessly. It shouldn't present any problems, but if you detect any custom wiring or unexpected changes already in place, adapt your approach accordingly to maintain the plan's objectives.

Task 1 — Read, Translate, and Update the Translation File
1. Read the existing `src/i18n/translations.ts` file, which currently contains all the English strings.
2. Translate all the English string values into Spanish.
3. Update `src/i18n/translations.ts` so it exports a `Translations` type and a `translations` object with two top-level keys: "en" and "es". Every key in the EN object must have a corresponding ES counterpart. The shape must be strongly typed so that accessing a missing key is a TypeScript compile error.

File signature example:
export type Lang = 'en' | 'es';
export type TranslationKeys = keyof typeof englishStrings; // Adapt based on current file structure
export type Translations = Record<TranslationKeys, string>;
export const translations: Record<Lang, Translations> = { en: { ... }, es: { ... } };

Task 2 — Create LanguageContext
Create `src/context/LanguageContext.tsx`. It must expose:
 • lang: Lang — current active language, defaulting to "en"
 • toggleLang: () => void — flips between "en" and "es"
 • t: (key: TranslationKeys) => string — lookup function that returns the translated string or falls back to the key itself if missing

Persist the selected language to `localStorage` under the key "portfolio-lang" so the preference survives page refresh. Read this value on mount as the initial state.

Task 3 — Wrap the App
In `src/App.tsx` (or `src/main.tsx` if App is trivial), wrap the entire component tree with `<LanguageProvider>`. No other structural changes to App.tsx.

Task 4 — Add the Language Toggle Button to the Nav
Locate the Nav component (`src/components/Nav.tsx` or equivalent). Identify the existing nav link list — the Education link is the last item. Immediately to the right of the Education link, add a new button element that:
 • Shares the same base visual logic and className pattern as the existing nav links (glass pill / hover-glow or whatever the current active pattern is).
 • Displays an icon followed by "ES" when lang === "en" (i.e., clicking will switch TO Spanish).
 • Displays an icon followed by "EN" when lang === "es" (i.e., clicking will switch TO English).
 • Calls `toggleLang()` on click. This is the trigger that swaps the UI text to Spanish.
 • Has `aria-label="Switch to Spanish"` / `"Switch to English"` for accessibility (these should also be translated using the `t()` function).
 • Is NOT an anchor tag — it is a `<button>` styled to match the nav aesthetic.

Do NOT introduce a new component for this button. Inline it in Nav unless the file exceeds 120 lines, in which case extract a `<LangToggle />` component in the same directory.

Task 5 — Wire up Strings in Section Components
For each component in `src/components/sections/`, import the `useLanguage` hook and ensure every user-visible string is replaced with a `t("key")` call matching the keys you read in Task 1. This includes: headings, subheadings, body copy, button labels, badge labels, aria-labels, placeholder text, and alt text for images.

Rules:
 • Do not replace code snippets, variable names, or technical identifiers.
 • Do not replace proper nouns that do not have a meaningful translation (e.g., library names, company names, tool names).

Task 6 — Update the Nav Anchor Labels
The nav anchor link labels (Hero, About, Tech Stack, Experience, Projects, Education) must also go through `t()`. The href anchors remain unchanged — only the visible label text is translated.

Task 7 — Smoke Test
After all replacements, run `npm run lint` to confirm zero new TypeScript or ESLint errors. Manually verify by toggling the language and confirming all sections switch coherently to Spanish with no untranslated keys visible (no raw key strings like "hero.title" rendered on screen).

Constraints & Non-goals
 • No external i18n library. Custom context only.
 • No SSR concerns — this is a pure client-side SPA (Vite).
 • No URL-based locale routing (/es/... paths). Language is UI state only.
 • No automatic browser locale detection on first load — default is always "en".
 • Do not add animations or transitions to the language switch beyond what already exists in the nav.
 • Do not restructure any existing component other than adding the hook import and replacing string literals.

Acceptance Criteria
 1. The agent verifies the codebase status before starting implementation.
 2. The existing English strings are successfully read and translated to Spanish within `translations.ts`.
 3. Clicking the globe/toggle button once extracts and displays the Spanish strings; clicking again returns to English.
 4. The button label reads "ES" in English mode and "EN" in Spanish mode.
 5. Language preference persists across hard refresh (`localStorage`).
 6. Zero hardcoded translatable strings remain in any section component.
 7. npm run lint passes with no new errors.
 8. TypeScript compilation passes — accessing `t("nonexistent.key")` causes a build error to prevent typos.

PROMPT END