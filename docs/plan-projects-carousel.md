# Plan Técnico: Projects Section — Carrusel 3D + Vista de Detalle

> **Objetivo**: Sustituir la sección `Projects` actual (stack vertical de 3 cards) por un carrusel 3D con vista de detalle, replicando la disposición y el comportamiento del referente, pero usando nuestro sistema de diseño (glassmorphism, tokens HSL, fuentes Space Grotesk / Inter / Courier Prime, MeshBackground, WindowChrome).

---

## 1. Estado Actual vs Objetivo

| Aspecto | Estado Actual | Objetivo |
|---------|---------------|----------|
| Disposición | Stack vertical de 3 cards completas | Carrusel 3D con `data-position` (-2..8) |
| Vista de detalle | Toda la info ya está en la card | Click → swap in-section con `riseOutBlur` / `slideInBlur` |
| Mockup del proyecto | `PhoneVideo` (frame de teléfono) o `BrowserPreview` (frame de navegador) | Media plano (video `<video>` o `<img>`), sin frame |
| Filtro por categoría | No existe | Chips de categoría (mobile / web) toggleables |
| Drag / swipe | No existe | Pointer events, umbral 50px, debounce 600ms |
| Teclado | No existe | ← / → shift, Esc cierra detalle, Tab navega acciones |
| Móvil | Mismo stack vertical | Grid vertical + Radix Dialog full-screen |
| Filtro tech (stack → projects) | No existe | **Fuera de alcance** (explícitamente diferido) |
| GitHub stars | No existe | Fuera de alcance (no API, no fallback estático) |

---

## 2. Decisiones de Diseño

### 2.1 Carrusel 3D con CSS puro y `data-position`

El referente usa selectores CSS `[data-position="N"]` para posicionar cada card en 3D. Lo replicamos tal cual:

```
.projectsStage  → transform-style: preserve-3d; position: relative
.projectCard    → position: absolute; inset: 0; margin: auto;
                  transition: transform .85s ease, opacity .85s ease;
                  pointer-events: none (excepto la activa)
.projectCard[data-position="3"]  → translateZ(0) scale(1)        opacity 1   z-index 2
.projectCard[data-position="2"]  → translateX(-280px) rotateY(20deg) scale(.88)  opacity .75
.projectCard[data-position="1"]  → translateX(-460px) rotateY(35deg) scale(.78)  opacity .55
.projectCard[data-position="0"]  → translateX(-580px) rotateY(45deg) scale(.68)  opacity .35
.projectCard[data-position="-1"] → translateX(-640px) rotateY(55deg) scale(.58)  opacity .20
.projectCard[data-position="-2"] → translateX(-680px) rotateY(60deg) scale(.50)  opacity 0   pointer-events none
.projectCard[data-position="4"]  → translateX(280px) rotateY(-20deg) scale(.88)   opacity .75
.projectCard[data-position="5"]  → translateX(460px) rotateY(-35deg) scale(.78)   opacity .55
.projectCard[data-position="6"]  → translateX(580px) rotateY(-45deg) scale(.68)   opacity .35
.projectCard[data-position="7"]  → translateX(640px) rotateY(-55deg) scale(.58)   opacity .20
.projectCard[data-position="8"]  → translateX(680px) rotateY(-60deg) scale(.50)   opacity 0
```

`perspective: 1400px` en el contenedor padre. Solo la card con `data-position="3"` es la activa y recibe pointer events.

### 2.2 Swap a vista de detalle in-section

El detalle reemplaza al carrusel en la misma sección (no es un modal overlay). Esto es exactamente lo que hace el referente y es más limpio para portafolios single-page.

```
viewMode = "carousel"        → render <ProjectsCarousel>
viewMode = "transitioning"   → render el anterior con clase "exiting" (animación de salida)
viewMode = "detail"          → render <ProjectDetail> con clase "entering" (animación de entrada)
```

Transiciones (idénticas al referente):
- `riseOutBlur` (salida carrusel, 500ms): opacity 1→0, translateY 0→-12, blur 0→10
- `slideInBlur` (entrada detalle, 600ms cubic-bezier(0.2, 0.8, 0.2, 1)): opacity 0→1, translateY -20→0, blur 10→0
- `riseOutBlur` (salida detalle, 400ms): simétrico

### 2.3 Mockups sin frame

El usuario decidió cambiar a media plano:
- GameVision → `<video src="/gamevision-demo.mp4" autoPlay muted loop playsInline />`
- MatchVision → `<video src="/matchvision-demo.mp4" autoPlay muted loop playsInline />`
- CasaHumedo → `<img src="/casahumedo-preview.png" alt="Casa Humedo preview" />`

`PhoneVideo.tsx` y `BrowserPreview.tsx` se quedan en el codebase pero ya no se importan aquí.

### 2.4 Chips de categoría

```
[ Todos ]  [ Mobile ]  [ Web ]
   ↑ activo cuando activeCategories.length === 0
[✓ Todos]  [ Mobile ]  [ Web ]   ← modo "todos"
[ Todos ]  [✓ Mobile]  [ Web ]   ← solo mobile
[ Todos ]  [ Mobile ]  [✓ Web]   ← solo web
[ Todos ]  [✓ Mobile]  [✓ Web]   ← ambas
```

Click en "Todos" → resetea a `[]`. Click en un chip → toggle en el array. Lógica: `[]` significa "todas las categorías" (ningún filtro activo).

### 2.5 Móvil: stack + Dialog

`useMediaQuery("(max-width: 768px)")` → si es true, no se monta el carrusel 3D. En su lugar:
- `MobileProjectList`: grid vertical de cards con la misma data. Cada card es un `<button>` que abre un Dialog.
- `MobileProjectDialog`: Radix `Dialog` con `className="fixed inset-0 w-screen h-screen rounded-none"` (full-screen real). Dentro, renderiza el mismo `<ProjectDetail>` (el contenido es el mismo).

### 2.6 Reduced motion

`matchMedia("(prefers-reduced-motion: reduce)")` se evalúa una vez al montar (no es reactivo en el MVP). Si es true:
- Las reglas `[data-position="N"]` con `transform` se sobreescriben con `transform: none` en el CSS módulo.
- Las animaciones de entrada/salida se reducen a `opacity 0 ↔ 1` en 200ms.

---

## 3. Modelo de Datos

`src/data/projects.ts`:

```ts
export type ProjectCategoryId = "mobile" | "web";

export type ProjectMedia =
  | { type: "video"; src: string; alt?: string }
  | { type: "image"; src: string; alt: string };

export type Project = {
  id: string;
  nameKey: string;             // "projects.gamevision_name"
  descKey: string;             // descripción corta (card)
  longDescKey?: string;        // descripción larga (detalle)
  badgeKey: string;            // "projects.gamevision_badge"
  media: ProjectMedia;         // plano
  githubUrl: string;
  liveUrl?: string;
  techTags: string[];
  categories: ProjectCategoryId[];
};

export const projectCategories: { id: ProjectCategoryId; i18nKey: string }[] = [
  { id: "mobile", i18nKey: "projects.filter_mobile" },
  { id: "web",    i18nKey: "projects.filter_web"    },
];
```

Proyectos iniciales (migración desde el `Projects.tsx` actual):

```ts
export const projects: Project[] = [
  {
    id: "gamevision",
    nameKey: "projects.gamevision_name",
    descKey: "projects.gamevision_desc",
    longDescKey: "projects.gamevision_long",
    badgeKey: "projects.gamevision_badge",
    media: { type: "video", src: "/gamevision-demo.mp4" },
    githubUrl: "https://github.com/AdrianPaez/GameVision",
    techTags: ["Flutter", "Dart", "Firebase", "Riverpod", "Twitch API"],
    categories: ["mobile"],
  },
  {
    id: "matchvision",
    nameKey: "projects.matchvision_name",
    descKey: "projects.matchvision_desc",
    longDescKey: "projects.matchvision_long",
    badgeKey: "projects.matchvision_badge",
    media: { type: "video", src: "/matchvision-demo.mp4" },
    githubUrl: "https://github.com/AdrianPaez/MatchVision",
    techTags: ["Kotlin", "Jetpack Compose", "Retrofit", "API-Football"],
    categories: ["mobile"],
  },
  {
    id: "casahumedo",
    nameKey: "projects.casahumedo_name",
    descKey: "projects.casahumedo_desc",
    longDescKey: "projects.casahumedo_long",
    badgeKey: "projects.casahumedo_badge",
    media: { type: "image", src: "/casahumedo-preview.png", alt: "Casa Humedo website" },
    githubUrl: "https://github.com/AdrianPaez/casaHumedo",
    liveUrl: "https://casahumedo.com",
    techTags: ["TypeScript", "React", "Vite", "Tailwind", "shadcn/ui"],
    categories: ["web"],
  },
];
```

---

## 4. Estructura de Archivos

```
src/
├── components/
│   └── sections/
│       ├── Projects.tsx              ← MANTENER nombre; reemplazar contenido
│       └── projects/
│           ├── ProjectsCarousel.tsx  ← NUEVO
│           ├── ProjectCard.tsx       ← NUEVO
│           ├── ProjectDetail.tsx     ← NUEVO
│           ├── ProjectCategoryChips.tsx ← NUEVO
│           ├── MobileProjectList.tsx ← NUEVO
│           ├── MobileProjectDialog.tsx ← NUEVO
│           └── projects.module.css   ← NUEVO
├── data/
│   └── projects.ts                   ← NUEVO (extraído de Projects.tsx)
├── i18n/
│   └── locales/
│       ├── es.json                   ← + filter_mobile, filter_web, longDesc*, view_details, back
│       └── en.json                   ← igual
└── hooks/
    └── useMediaQuery.ts              ← NUEVO (reutilizable; ya existe patrón similar en Trayectoria)
```

`Projects.tsx` ahora hace:

```tsx
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ProjectsCarousel from "./projects/ProjectsCarousel";
import MobileProjectList from "./projects/MobileProjectList";
// state arriba...
const isMobile = useMediaQuery("(max-width: 768px)");

return (
  <SectionContainer id="projects">
    <WindowChrome title="~/projects — ls -la">
      {viewMode === "detail" ? <ProjectDetail ... /> :
        isMobile ? <MobileProjectList ... /> :
                   <><ProjectCategoryChips /><ProjectsCarousel /></>}
    </WindowChrome>
  </SectionContainer>
);
```

---

## 5. Componentes — Detalle de Implementación

### 5.1 `useMediaQuery`

```ts
// src/hooks/useMediaQuery.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}
```

### 5.2 `ProjectsCarousel.tsx`

Responsabilidades:
- Recibe `projects` (filtrados), `currentIndex`, `setCurrentIndex`, `onSelect(project)`.
- Calcula el `positionMap` con `useMemo` (índice 0 → position 3, índice 1 → position 4, ..., índice -1 → position 2, etc.).
- `useId()` para a11y y `onKeyDown` para ← / →.
- Pointer handlers en el contenedor para drag.

```tsx
const positionMap = useMemo(() => {
  return projects.map((_, i) => 3 + (i - currentIndex));
}, [projects, currentIndex]);
```

Drag handlers (esquema, 30 líneas):
- `onPointerDown` → guarda `startX`, `isDragging = true`.
- `onPointerMove` → calcula `deltaX`. Si `|deltaX| > 50`, llama `setCurrentIndex` con debounce 600ms y resetea `startX`.
- `onPointerUp` / `onPointerCancel` → `isDragging = false`.

### 5.3 `ProjectCard.tsx`

Props: `project`, `position` (número), `isActive` (bool), `onSelect`.

```tsx
<article
  className={styles.projectCard}
  data-position={position}
  data-active={isActive}
  onClick={isActive ? () => onSelect(project) : undefined}
  onKeyDown={isActive ? (e) => e.key === "Enter" && onSelect(project) : undefined}
  tabIndex={isActive ? 0 : -1}
  aria-hidden={!isActive}
>
  <div className={styles.media}>
    {project.media.type === "video"
      ? <video src={project.media.src} autoPlay muted loop playsInline />
      : <img src={project.media.src} alt={project.media.alt ?? ""} />}
  </div>
  <div className={styles.body}>
    <span className="text-gradient-primary">{t(project.badgeKey)}</span>
    <h3>{t(project.nameKey)}</h3>
    <p>{t(project.descKey)}</p>
    <div className={styles.techRow}>
      {project.techTags.map(tag => <span key={tag} className="tech-chip">{tag}</span>)}
    </div>
    <div className={styles.actions}>
      <Button variant="primary" onClick={...}>{t("projects.view_details")}</Button>
      <a href={project.githubUrl} target="_blank" rel="noreferrer">
        <Button variant="ghost"><GithubIcon /> GitHub</Button>
      </a>
    </div>
  </div>
</article>
```

El glassmorphism se aplica con `className="glass"` (utility ya existente) o equivalente en el módulo CSS.

### 5.4 `ProjectDetail.tsx`

Grid 2-col en desktop (3fr / 2fr), stack vertical en móvil (pero el móvil usa su propio Dialog, así que el detalle desktop es siempre 2-col).

```tsx
<div className={`${styles.detail} ${isExiting ? styles.exiting : styles.entering}`}>
  <div className={styles.media}>
    {project.media.type === "video" ? <video ... controls /> : <img ... />}
  </div>
  <div className={styles.info}>
    <Button variant="ghost" onClick={onBack}>← {t("projects.back")}</Button>
    <span className="text-gradient-primary">{t(project.badgeKey)}</span>
    <h2>{t(project.nameKey)}</h2>
    <p>{t(project.longDescKey ?? project.descKey)}</p>
    <div className={styles.techRow}>
      {project.techTags.map(tag => <span key={tag} className="tech-chip">{tag}</span>)}
    </div>
    <div className={styles.actions}>
      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">
        <Button variant="primary">{t("projects.view_site")}</Button>
      </a>}
      <a href={project.githubUrl} target="_blank" rel="noreferrer">
        <Button variant={project.liveUrl ? "ghost" : "primary"}>
          <GithubIcon /> {t("projects.view_repo")}
        </Button>
      </a>
    </div>
  </div>
</div>
```

### 5.5 `ProjectCategoryChips.tsx`

```tsx
const isActive = (id) =>
  id === "all" ? activeCategories.length === 0 : activeCategories.includes(id);

return (
  <div className={styles.chips}>
    <button
      data-active={isActive("all")}
      onClick={() => setActiveCategories([])}
    >{t("projects.filter_all")}</button>
    {projectCategories.map(c => (
      <button
        key={c.id}
        data-active={isActive(c.id)}
        onClick={() => toggleCategory(c.id)}
      >{t(c.i18nKey)}</button>
    ))}
  </div>
);
```

### 5.6 `MobileProjectList.tsx` y `MobileProjectDialog.tsx`

`MobileProjectList` renderiza un grid vertical de cards compactas (sin `data-position`):

```tsx
<div className={styles.mobileGrid}>
  {projects.map(p => (
    <button key={p.id} className="glass" onClick={() => onSelect(p)}>
      <div className={styles.media}>
        {p.media.type === "video" ? <video src={p.media.src} muted /> : <img src={p.media.src} alt={p.media.alt ?? ""} />}
      </div>
      <h3>{t(p.nameKey)}</h3>
      <p>{t(p.descKey)}</p>
    </button>
  ))}
</div>
```

`MobileProjectDialog` envuelve `ProjectDetail` en un Radix `Dialog.Content` con `className="fixed inset-0 w-screen h-screen max-w-none rounded-none p-4 overflow-y-auto"`.

---

## 6. CSS — `projects.module.css`

Solo las reglas estructurales del carrusel y las animaciones. Glassmorphism y colores se aplican via utilities de Tailwind (`glass`, `text-gradient-primary`) o vars HSL (`--primary`, `--background`, etc.).

```css
.projectsCarousel { position: relative; perspective: 1400px; cursor: grab; touch-action: pan-y; }
.projectsCarousel:active { cursor: grabbing; }
.projectsStage    { position: relative; width: 100%; height: 540px; transform-style: preserve-3d; }

.projectCard {
  position: absolute; inset: 0; margin: auto;
  width: min(720px, 90%); height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.85s ease, opacity 0.85s ease;
  pointer-events: none;
}
.projectCard[data-active="true"] { pointer-events: auto; }

/* Posiciones (idénticas al referente) */
.projectCard[data-position="3"]  { transform: translateZ(0)      scale(1);    opacity: 1;    z-index: 2; }
.projectCard[data-position="2"]  { transform: translateX(-280px) rotateY(20deg)  scale(0.88); opacity: 0.75; z-index: 1; }
.projectCard[data-position="1"]  { transform: translateX(-460px) rotateY(35deg)  scale(0.78); opacity: 0.55; }
.projectCard[data-position="0"]  { transform: translateX(-580px) rotateY(45deg)  scale(0.68); opacity: 0.35; }
.projectCard[data-position="-1"] { transform: translateX(-640px) rotateY(55deg)  scale(0.58); opacity: 0.20; }
.projectCard[data-position="-2"] { transform: translateX(-680px) rotateY(60deg)  scale(0.50); opacity: 0;    }
.projectCard[data-position="4"]  { transform: translateX(280px)  rotateY(-20deg) scale(0.88); opacity: 0.75; z-index: 1; }
.projectCard[data-position="5"]  { transform: translateX(460px)  rotateY(-35deg) scale(0.78); opacity: 0.55; }
.projectCard[data-position="6"]  { transform: translateX(580px)  rotateY(-45deg) scale(0.68); opacity: 0.35; }
.projectCard[data-position="7"]  { transform: translateX(640px)  rotateY(-55deg) scale(0.58); opacity: 0.20; }
.projectCard[data-position="8"]  { transform: translateX(680px)  rotateY(-60deg) scale(0.50); opacity: 0;    }

/* Detalle */
.detail { display: grid; grid-template-columns: 3fr 2fr; gap: 2rem; }
.entering { animation: slideInBlur 600ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
.exiting  { animation: riseOutBlur 400ms ease both; }

@keyframes slideInBlur {
  from { opacity: 0; transform: translateY(-20px); filter: blur(10px); }
  to   { opacity: 1; transform: translateY(0);     filter: blur(0); }
}
@keyframes riseOutBlur {
  from { opacity: 1; transform: translateY(0);    filter: blur(0); }
  to   { opacity: 0; transform: translateY(-12px); filter: blur(10px); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .projectCard { transition: opacity 200ms ease; transform: none !important; }
  .entering, .exiting { animation-duration: 200ms; }
}
```

---

## 7. i18n — Claves nuevas

`src/i18n/locales/es.json` y `en.json` (en `projects.*`):

```jsonc
{
  "filter_all":   "Todos",
  "filter_mobile":"Mobile",
  "filter_web":   "Web",
  "view_details": "Ver detalles",
  "view_site":    "Ver sitio",
  "view_repo":    "Ver repo",
  "back":         "Volver",
  "no_results":   "No hay proyectos con ese filtro",
  "clear_filters":"Quitar filtros",
  // existentes:
  "gamevision_name":  "...",
  "gamevision_desc":  "...",
  "gamevision_long":  "...",
  "gamevision_badge": "Mobile · Flutter",
  "matchvision_name": "...",
  // ...
}
```

(El bloque `projects` actual se mantiene, solo se añaden las claves nuevas y los `*_long`.)

---

## 8. Plan de Ejecución

### Fase 1 — Data + i18n (sin tocar UI)
1. Crear `src/data/projects.ts` con el modelo y los 3 proyectos migrados.
2. Añadir claves nuevas a `es.json` y `en.json`.

### Fase 2 — CSS + componente raíz
3. Crear `src/components/sections/projects/projects.module.css` con todas las reglas de la sección 6.
4. Crear `src/hooks/useMediaQuery.ts`.

### Fase 3 — Componentes hoja
5. `ProjectCategoryChips.tsx` (sin estado; props `activeCategories` + `setActiveCategories`).
6. `ProjectCard.tsx` (presentacional; recibe `project`, `position`, `isActive`, `onSelect`).
7. `ProjectDetail.tsx` (presentacional; recibe `project`, `onBack`, `isExiting`).
8. `MobileProjectList.tsx` (presentacional).
9. `MobileProjectDialog.tsx` (envuelve `ProjectDetail` en Radix Dialog).

### Fase 4 — Componentes compuestos
10. `ProjectsCarousel.tsx` (estado: drag + keyboard; recibe `projects`, `currentIndex`, `setCurrentIndex`, `onSelect`).
11. Refactor `src/components/sections/Projects.tsx` para orquestar estado global, decidir mobile vs desktop, y montar el sub-componente correcto según `viewMode`.

### Fase 5 — QA
12. `npm run lint`.
13. `npm test` (escribir tests para `positionMap`, `useMediaQuery`, toggle de categorías).
14. `npm run build:dev` (verificar que compila).
15. Visual QA manual: desktop (carrusel + drag + teclado), móvil (stack + Dialog), reduced motion.
16. `npm run dev` y revisar que la sección aparece dentro del `WindowChrome` con id `projects`.

---

## 9. Riesgos y Mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| 3D transform se ve mal en Firefox antiguo | Aceptable: el target del portfolio es dev/senior, navegadores modernos |
| Videos pesados en mobile consumen batería | `<video>` en card del carrusel móvil usa `preload="none"`; solo el detalle tiene `controls autoplay` |
| `WindowChrome` puede no dar altura suficiente al carrusel | El CSS del módulo usa `height: 540px` en `.projectsStage` (ajustable en QA) |
| Drag conflicts con scroll vertical en mobile | `touch-action: pan-y` permite scroll vertical; el drag del carrusel solo dispara cuando `deltaX > deltaY` |
| `data-position` de cards lejanas sale del viewport | `overflow: hidden` en el contenedor del carrusel |

---

## 10. Verificación Final (Definition of Done)

- [ ] `npm run dev` levanta en puerto 8080 sin warnings nuevos.
- [ ] Sección `Projects` muestra el carrusel 3D en desktop con 3 cards; la central es la única clickeable.
- [ ] Click en card central → animación de salida del carrusel (≤500ms) → entrada del detalle (≤600ms).
- [ ] Detalle muestra media plano (video o img), título, descripción larga, tech chips, GitHub, y botón "Ver sitio" solo en CasaHumedo.
- [ ] Botón "Volver" → animación inversa → carrusel reaparece.
- [ ] Chips de categoría filtran los proyectos visibles.
- [ ] Flechas ← / → cambian el proyecto activo.
- [ ] Drag horizontal funciona con umbral 50px y debounce 600ms.
- [ ] Móvil (<768px) muestra grid vertical; click abre Dialog full-screen.
- [ ] `prefers-reduced-motion: reduce` desactiva 3D y reduce animaciones a opacity.
- [ ] `npm run lint` y `npm test` pasan.
- [ ] Sin nuevas dependencias añadidas.
