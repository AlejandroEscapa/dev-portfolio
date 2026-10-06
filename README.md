# 🚀 dev-portfolio

Portfolio personal con estética de sistema operativo de escritorio: ventanas
con semáforos, dock lateral colapsable, terminal CLI, búsqueda Spotlight,
overlay CRT conmutable y hero 3D holográfico.

**🌐 En producción:** [aoe-dev.vercel.app](https://aoe-dev.vercel.app)
(Vercel despliega automáticamente `main`)

## ✨ Features

### Interactividad

- 🖥 **BootSequence** — animación de arranque estilo terminal al cargar la página
- 📌 **Dock** — rail vertical fijo a la izquierda (colapsable, 52px → 184px) con secciones, GitHub/LinkedIn, CV, idioma y terminal
- ⌨️ **CliTerminal** — terminal interactiva (`help`, `whoami`, `projects`, `theme`, `neofetch`…) — ver `src/lib/cli-commands.ts`
- 🔍 **Spotlight** — buscador estilo `⌘K` para saltar a secciones, abrir social o cambiar de tema
- 📺 **CRT Overlay** — efecto retro CRT (scanlines + viñeta) conmutable, desactivado con `prefers-reduced-motion`
- 🪟 **WindowChrome** — cada sección es una ventana con semáforos (cerrar, minimizar, maximizar)

### Diseño y 3D

- 🧊 **Hero 3D** — figura GLB en cápsula holográfica (R3F + drei + bloom), lazy-loaded en su propio chunk, con fallback estático por dispositivo (`useDeviceTier`)
- 🎨 **Themes** — 4 temas: `indigo` (default), `Catppuccin`, `Dracula`, `Tokyo Night` — pipeline de tokens JSON → CSS/TS (`src/styles/tokens/`)
- 🌐 **i18n** — español / inglés con cambio dinámico desde el dock (sistema propio, sincroniza `<html lang>`)
- ✨ Glassmorphism y liquid-glass en ventanas y overlays

### Secciones

`HeroShowcase` (3D + Welcome + TechBento) · `Projects` · `Trayectoria` (timeline horizontal GSAP) · `Education` · `Contact` · `Footer`

## 🛠️ Stack

| Capa            | Tecnología                                     |
| --------------- | ---------------------------------------------- |
| Build           | Vite 5 + TypeScript 5.8                        |
| UI              | React 18 + Tailwind CSS v4 (CSS-first) + shadcn/ui (Radix) |
| Routing         | React Router v6                                |
| Animación / 3D  | Framer Motion, GSAP + ScrollTrigger, Lenis, React Three Fiber + drei |
| Formularios     | react-hook-form + zod (contacto = `mailto:` launcher) |
| i18n            | `LanguageProvider` propio (`src/i18n/translations.ts`) |
| Tests           | Vitest + Testing Library (55 tests)            |
| Lint            | ESLint flat config                             |

## 🚀 Scripts

```bash
npm run dev          # Dev server en http://localhost:8080 (regenera tokens)
npm run build        # Build de producción (genera dist/)
npm run build:dev    # Build en modo desarrollo
npm run preview      # Servir el build localmente
npm run tokens       # Regenerar tokens CSS/TS desde los JSON fuente
npm run lint         # ESLint (config plana, eslint .)
npm test             # Vitest single run
npm run test:watch   # Vitest watch mode
```

## 📁 Estructura

```
src/
├── App.tsx                  # Providers + router + overlays globales
├── main.tsx                 # Entry point
├── index.css                # Tailwind v4 + design tokens (HSL custom props)
├── pages/
│   ├── Index.tsx            # Página principal (composición de secciones)
│   └── NotFound.tsx
├── components/
│   ├── ui/                  # Primitives shadcn — no editar a mano (ver AGENTS.md §7)
│   ├── sections/            # Hero, HeroShowcase, TechBento, Projects, Trayectoria, Education, Contact
│   │   └── projects/        # Carrusel, tarjeta, chips de categoría, detalle
│   ├── three/               # Escena 3D (Scene, HeroScene, HoloFigure)
│   ├── background/          # ImageBackground (LCP, srcSet)
│   ├── bento/               # BentoGrid + BentoCard
│   ├── boot/                # BootSequence
│   ├── dock/                # Dock (rail izquierdo)
│   ├── cli/                 # CliTerminal
│   ├── spotlight/           # Spotlight (⌘K)
│   ├── crt/                 # CrtOverlay + CRTToggle
│   ├── window/              # WindowChrome wrapper
│   ├── theme-switcher/      # ThemeMenu
│   ├── Footer.tsx           # Datos de contacto al pie (email, tel, social)
│   ├── Nav.tsx / NavLink.tsx
│   └── brand-icons.tsx      # Marcas no disponibles en simple-icons (LinkedIn)
├── hooks/                   # useTheme, useLenis, useDeviceTier, useDockHover, ...
├── lib/                     # cli-commands, spotlight-items, themes, gsap, config
├── i18n/                    # translations (ES/EN)
├── data/                    # projects.ts, trayectoria.ts
├── styles/
│   ├── tokens/              # FUENTE de la verdad del diseño (JSON, no tocar generated/)
│   └── generated/           # tokens.css / tokens.ts — generado, no editar
└── context/                 # LanguageContext
```

## ⚙️ Personalización

### Cambiar el tema
Los temas viven en `src/styles/tokens/themes/*.json` (delta de HSL sobre
el tema base). Para añadir uno nuevo: crea el JSON, añádelo a
`tokens.index.json` y al union `ThemeId` en `src/lib/themes.ts`. La
documentación completa del pipeline está en `AGENTS.md` §4.

### Añadir comandos CLI
Edita `src/lib/cli-commands.ts` y el `HELP` del mismo fichero.

### Añadir items al Spotlight
Edita `src/lib/spotlight-items.ts`.

### Traducir / añadir idiomas
Edita `src/i18n/translations.ts` — siempre ambas locales (`en` y `es`) juntas.

## 📦 Despliegue

Vercel con integración de GitHub: cada push a `main` se despliega
automáticamente en [aoe-dev.vercel.app](https://aoe-dev.vercel.app).
Esa URL es la canónica usada por los meta tags (`canonical`, `og:url`,
`og:image`) y el JSON-LD — si cambia el dominio, actualizar `index.html`.

Build local de verificación:

```bash
npm run build && npm run preview
```

## 📄 Licencia

Todos los derechos reservados — © Alejandro Olivares Escapa.
