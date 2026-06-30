# 🚀 dev-portfolio

Portfolio personal interactivo con estética terminal y glassmorphism. Boot sequence animada, dock flotante, terminal CLI integrada, búsqueda Spotlight y overlay CRT conmutable.

## ✨ Features

### Interactividad

- 🖥 **BootSequence** — animación de arranque estilo terminal al cargar la página
- 📌 **Dock** — dock flotante estilo macOS con acceso rápido a secciones
- ⌨️ **CliTerminal** — terminal interactiva con comandos para navegar, buscar ayuda y ejecutar acciones
- 🔍 **Spotlight** — buscador rápido estilo `⌘K` para saltar a cualquier sección, proyecto o comando
- 📺 **CRT Overlay** — efecto retro CRT (scanlines + viñeta) conmutable
- 🪟 **WindowChrome** — cada sección se presenta como una ventana de terminal con título realista

### Diseño

- 🎨 **Themes** — 4 temas disponibles: `default` (violeta/cian), `Catppuccin`, `Dracula`, `Tokyo Night`
- 🌐 **i18n** — español / inglés con cambio dinámico desde el dock
- 🌀 **MeshBackground** — fondo animado con gradiente mesh de cuatro colores
- 🧩 **BentoGrid** — sistema de tarjetas para proyectos y tech stack
- ✨ Glassmorphism y liquid-glass en ventanas y overlays

### Secciones

`Hero` · `About` · `Profile` · `TechStack` · `Experience` · `Projects` · `Education` · `Contact`

## 🛠️ Stack

| Capa            | Tecnología                                     |
| --------------- | ---------------------------------------------- |
| Build           | Vite 5                                         |
| UI              | React 18 + TypeScript 5                        |
| Estilos         | Tailwind CSS v4 + shadcn/ui (Radix)            |
| Routing         | React Router v6                                |
| Estado async    | TanStack Query                                 |
| Animaciones     | Framer Motion                                  |
| Formularios     | react-hook-form + zod                          |
| i18n            | i18next + react-i18next                        |
| Tests           | Vitest + Testing Library                       |
| Lint            | ESLint flat config                             |

## 🚀 Scripts

```bash
npm run dev          # Dev server en http://localhost:8080
npm run build        # Build de producción (genera dist/)
npm run build:dev    # Build en modo desarrollo
npm run preview      # Servir el build localmente
npm run lint         # ESLint (config plana, eslint .)
npm test             # Vitest single run
npm run test:watch   # Vitest watch mode
```

## 📁 Estructura

```
src/
├── App.tsx                  # Router + providers + componentes globales
├── main.tsx                 # Entry point
├── index.css                # Tailwind v4 + design tokens (HSL custom props)
├── pages/
│   ├── Index.tsx            # Página principal (composición de secciones)
│   └── NotFound.tsx
├── components/
│   ├── ui/                  # Primitives shadcn — no editar a mano
│   ├── sections/            # Hero, About, Projects, Experience, ...
│   ├── boot/                # BootSequence
│   ├── dock/                # Dock + DockItem
│   ├── cli/                 # CliTerminal
│   ├── spotlight/           # Spotlight (⌘K)
│   ├── crt/                 # CrtOverlay + CRTToggle
│   ├── window/              # WindowChrome wrapper
│   ├── theme-switcher/      # ThemeSwitcher
│   ├── bento/               # BentoGrid + BentoCard
│   ├── MeshBackground.tsx
│   ├── LensFlareOverlay.tsx
│   ├── OrbitalBlob.tsx
│   └── Nav.tsx
├── hooks/                   # useTheme, useBootSequence, useTerminalHistory, ...
├── lib/                     # cli-commands, spotlight-items, themes, utils
├── i18n/                    # translations (ES/EN)
└── context/                 # LanguageContext
```

## ⚙️ Personalización

### Cambiar el tema por defecto
Edita `src/index.css` en `:root` y los bloques `[data-theme="..."]`. Todas las variables son HSL.

### Añadir comandos CLI
Edita `src/lib/cli-commands.ts` — cada comando tiene aliases, descripción y handler.

### Añadir items al Spotlight
Edita `src/lib/spotlight-items.ts`.

### Traducir / añadir idiomas
Edita `src/i18n/translations.ts`.

## 📦 Despliegue

Build estático en `dist/` después de `npm run build`. Funciona con cualquier host estático: Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.

```bash
npm run build && npm run preview
```

## 📄 Licencia

MIT
