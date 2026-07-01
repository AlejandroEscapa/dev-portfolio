# Spec: Sección "Trayectoria" con scroll horizontal pinned

**Fecha**: 2026-07-01
**Estado**: Diseño aprobado por el usuario, pendiente de spec review final
**Reemplaza**: `src/components/sections/Experience.tsx` (timeline vertical actual)

## 1. Resumen

Reemplazar la sección actual de Experiencia por una nueva sección **"Trayectoria"** con scroll horizontal pinned. La sección presenta 9 hitos vitales (experiencia laboral, formación, certificaciones, prácticas) ordenados cronológicamente. Las cards se distribuyen en zigzag sobre un eje horizontal central. La sección ocupa el viewport completo y usa `ScrollTrigger` (GSAP) con `pin: true` + `scrub: 1` para convertir el scroll vertical del usuario en scroll horizontal del track.

## 2. Objetivos y no-objetivos

### Objetivos
- Impacto visual equivalente al referente (carlos-bolivar portfolio).
- Coherencia con la estética glass-morphism del resto del portfolio.
- Sustituye completamente la sección de Experiencia actual.
- Reutiliza el stack ya instalado (GSAP 3.15, Lenis 1.3, framer-motion 12).
- Mantiene i18n es/en.
- Funciona en mobile con fallback a stack vertical.

### No-objetivos
- No usa `WindowChrome` para esta sección.
- No añade Draggable (sin arrastre con ratón).
- No añade entry animations por card (solo scroll-driven).
- No añade parallax 3D (la propiedad `perspective: 1000px` queda en el CSS por si se quiere añadir después).
- No abre modales de detalle: las cards muestran el contenido reducido directamente.

## 3. Decisiones arquitectónicas

| Decisión | Elección | Razón |
|---|---|---|
| Tipo de sección | Independiente (sin WindowChrome) | `pin: true` necesita full-viewport, incompatible con chrome de ventana |
| Layout | Zigzag top/bottom en eje central | Patrón del referente, máximo impacto visual |
| Tamaño cards | 380px ancho fijo, 2 alturas (260px / 380px) | Cabe en viewport con axis line y paddings; 2 alturas según contenido |
| Motor de animación | GSAP ScrollTrigger (`pin: true`, `scrub: 1`) | Patrón canónico del referente, ya instalado y sincronizado con Lenis |
| Estilo visual | Glass-morphism | Coherente con el resto del portfolio |
| Contenido | 9 items cronológicos (trayectoria completa) | Suficiente masa para que el scroll horizontal tenga cuerpo |
| Variantes de card | "Milestone" (corta) + "Experience" (con bullets) | Maneja variedad real de contenido sin modal ni alturas desbalanceadas |
| Mobile | Stack vertical sin pin | 380px no cabe en mobile con contexto |

## 4. Modelo de datos

```ts
// src/data/trayectoria.ts

export type Category = "experience" | "education" | "certification" | "internship";
export type Variant = "milestone" | "experience";

export interface TrayectoriaItem {
  id: string;
  category: Category;
  startDate: string;       // "YYYY-MM"
  endDate: string;         // "YYYY-MM" o "present"
  titleKey: string;        // i18n key del título (rol, grado, certificación)
  orgKey: string;          // i18n key de la organización
  locationKey: string;     // i18n key de la ubicación
  modalityKey?: string;    // i18n key opcional: "Presencial" | "Remoto" | "Jornada parcial"
  detailKey?: string;      // i18n key opcional, 1 línea de resumen (milestone)
  variant: Variant;
  bulletKeys?: string[];   // i18n keys, max 3, solo en variant="experience"
  techTags?: string[];     // strings literales, solo en variant="experience"
}
```

**Notas**:
- Las cadenas traducibles van en `src/i18n/translations.ts` bajo `trayectoria.items[id].*`.
- `techTags` son nombres propios de tecnologías que no se traducen.
- `endDate: "present"` se renderiza como "Actualidad" via i18n.

## 5. Datos concretos (9 items)

Orden cronológico ascendente (de más antiguo a más reciente):

| # | id | Fechas | Categoría | Variante | Título | Organización |
|---|---|---|---|---|---|---|
| 1 | `alsea` | 2019-06 / 2020-05 | experience | milestone | Cocinero | Alsea |
| 2 | `dam` | 2021-11 / 2023-05 | education | experience | Técnico Superior DAM | IES San Andrés |
| 3 | `leasba` | 2023-03 / 2023-05 | internship | experience | Desarrollador en prácticas | Leasba |
| 4 | `master` | 2024-01 / 2026-03 | education | experience | Máster Android/iOS | Tokio School |
| 5 | `pez_tomillo` | 2024-03 / 2024-08 | experience | milestone | Cocinero | PEZ TOMILLO SL |
| 6 | `udon` | 2025-03 / 2026-01 | experience | milestone | Segundo de cocina | UDON Asian Food |
| 7 | `ibm_ai` | 2026-02 / 2026-02 | certification | milestone | AI Fundamentals | IBM |
| 8 | `mas` | 2026-03 / 2026-06 | internship | experience | Frontend Tech Lead (Prácticas) | MAS Ingeniería |
| 9 | `big_school` | 2026-06 / 2026-06 | certification | milestone | IA con Agentes | BIG school |

**Decisión de bullets** (los items largos se truncan a los 3 más impactantes):

- `leasba` (5 originales → 3): "Desarrollo y adaptación del sistema de facturación según las necesidades del negocio", "Especialización técnica en Microsoft Business Central y Microsoft AL", "Personalización del ERP y diseño de flujos de trabajo a medida para clientes".
- `mas` (3 originales → 3, todos): "Arquitectura y desarrollo desde cero con estructura modular, limpia y escalable", "Coordinación directa con backend y producto para definir integración y flujos críticos", "Diseño de UX fluida y fiable adaptada a las necesidades del negocio y del hardware físico".

**Tech tags** (solo en `mas`): `["Angular", "TypeScript", "RxJS"]`.

## 6. Anatomía del componente

```
┌─ <section> (ref={containerRef}, id="trayectoria") ────────────────────┐
│  Pin point: top of viewport cuando entra                                │
│                                                                        │
│  ┌─ Header (z-20, fixed visually) ──────────────────────────────────┐ │
│  │  Etiqueta: ~/trayectoria.log                                    │ │
│  │  Título: "Mi <Trayectoria>" (gradiente)                         │ │
│  │  Indicador: "3 / 9" (progreso del scroll horizontal)            │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─ <div ref={trackRef}> track horizontal ───────────────────────────┐ │
│  │  padding: 0 10vw 0 10vw                                          │ │
│  │  display: flex, align-items: center, width: max-content          │ │
│  │                                                                   │ │
│  │  [Title card "Mi Trayectoria"]                                   │ │
│  │       │                                                           │ │
│  │       ├─── eje horizontal (línea 2px gradiente) ──── ... ───┐    │ │
│  │       │                                                       │    │ │
│  │  ┌──┴──┐ dot  ┌──────┐ dot  ┌──┴──┐ dot  ┌──────┐ dot  ...   │    │ │
│  │  │ top │      │ bot  │      │ top │      │ bot  │            │    │ │
│  │  │ #1  │      │ #2   │      │ #3  │      │ #4   │            │    │ │
│  │  └─────┘      └──────┘      └─────┘      └──────┘            │    │ │
│  │  [milestone]  [experience]  [experience]  [experience]         │    │ │
│  │                                                                   │ │
│  │  ... (5 items más) ...                                           │ │
│  │                                                                   │ │
│  │  [CTA final: "Conecta conmigo → LinkedIn"]                       │    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

**Posición de los items** (alternancia top/bottom por índice par/impar):
- 0 (alsea): top
- 1 (dam): bottom
- 2 (leasba): top
- 3 (master): bottom
- 4 (pez_tomillo): top
- 5 (udon): bottom
- 6 (ibm_ai): top
- 7 (mas): bottom
- 8 (big_school): top

**Conector visual** (línea + dot por item):
- Línea eje: `position: absolute; top: 50%; height: 2px;` ancho del track, gradiente horizontal `from-transparent via-primary/40 to-transparent`.
- Dot por item: `position: absolute; top: 50%; left: 50%` (centro del item), círculo 10px blanco con `border-2 border-background`. El item más reciente (`big_school`) tiene glow adicional.
- Línea conectora vertical por card: 40px de alto, 1px de ancho, `bg-primary/50`, conecta el dot con la card.

## 7. Comportamiento de animación

**Setup en `useLayoutEffect`** (después de que el DOM esté listo para medir `track.scrollWidth`):

```ts
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    const tween = gsap.to(trackRef.current!, {
      x: () => -(trackRef.current!.scrollWidth - window.innerWidth + 10 * window.innerWidth / 100),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${trackRef.current!.scrollWidth - window.innerWidth + 10 * window.innerWidth / 100}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

**Comportamiento**:
- Cuando el top de la sección llega al top del viewport → pin activo.
- El scroll vertical de la página se traduce en `translateX` del track.
- `scrub: 1` suaviza 1 segundo: scroll rápido no produce saltos bruscos.
- `anticipatePin: 1`: cubre el edge case del HMR de Vite y del scroll inicial.
- `invalidateOnRefresh: true`: recalcula dimensiones en cada resize de ventana.
- Al desmontar: `ctx.revert()` destruye los ScrollTriggers huérfanos.

**Sin Draggable. Sin entry animations por card.** El único motion es el translateX del track.

## 8. Estilos visuales

### Sección
- Background: `bg-background/40` con `mesh-bg` sutil (reutiliza clase existente).
- Padding: `py-24` arriba y abajo (más generoso que el resto para dar respiro).
- Altura mínima: `100vh` durante el pin.

### Card Milestone (380×260px)
- `glass` + `liquid-glass` + `border-white/10`.
- Padding: `p-6`.
- Estructura interna:
  - **Categoría** (arriba): pill pequeño `inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-accent`. Icono lucide a la izquierda (`Briefcase` / `GraduationCap` / `Award`).
  - **Fecha**: `text-xs uppercase tracking-wider text-muted-foreground`.
  - **Título**: `text-xl font-semibold tracking-tight text-foreground`.
  - **Organización**: `text-sm font-medium text-primary`.
  - **Ubicación + modalidad**: `text-xs text-muted-foreground`.
  - **Detalle** (1 línea): `text-sm text-foreground/80 leading-relaxed`.

### Card Experience (380×380px)
- `glass-strong` + `border-white/15`.
- Mismo header que Milestone, más:
- **Bullets** (3): lista con dot `bg-primary` circular, `text-sm leading-relaxed text-foreground/85`.
- **Tech tags** (al final): flex-wrap de pills `rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-foreground`.

### Card Title (primera del track, "Mi Trayectoria")
- Width: `auto` (no 380px), min-width 350px.
- Sin borde ni glass, solo texto grande.
- `text-gradient-primary` (clase existente) en el texto "Mi".
- `text-6xl font-bold tracking-tighter`.

### Card CTA final ("Conecta conmigo")
- Width: 380px.
- `glass-strong` + `border-white/15` + glow `glow-primary`.
- Icono LinkedIn (de `lucide-react`) grande centrado.
- Texto: "Conecta conmigo" (i18n).
- Enlace externo a LinkedIn.

### Eje y dots
- Línea eje: `position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: linear-gradient(to right, transparent, hsl(var(--primary) / 0.4), transparent); transform: translateY(-50%); z-index: 1;`.
- Dot: `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: white; border-radius: 50%; border: 2px solid hsl(var(--background)); z-index: 3;`.
- Dot glow (último item): `box-shadow: 0 0 16px hsl(var(--primary) / 0.6);`.

### Container del track
- `display: flex; align-items: center; width: max-content; padding: 0 10vw; cursor: default; will-change: transform; perspective: 1000px;`.

## 9. i18n

El proyecto usa keys planas (`Translations = { [key: string]: string }` con `t(key)` haciendo lookup directo). Por tanto todas las keys aquí son strings planos con prefijo `trayectoria.`.

### Keys a añadir en `src/i18n/translations.ts` (en y es)

```ts
// Cabecera
"trayectoria.section_label":  "04 \u2014 Journey" // en
"trayectoria.section_label":  "04 \u2014 Trayectoria" // es
"trayectoria.heading_before": "My" // en
"trayectoria.heading_after":  "Journey" // en
"trayectoria.heading_before": "Mi" // es
"trayectoria.heading_after":  "Trayectoria" // es
"trayectoria.progress":       "{current} / {total}"
"trayectoria.cta_title":      "Connect with me"
"trayectoria.cta_title":      "Conecta conmigo" // es
"trayectoria.cta_subtitle":   "Let's talk about your next project"
"trayectoria.cta_subtitle":   "Hablemos de tu próximo proyecto" // es
"trayectoria.present":        "Present" / "Actualidad"

// Categorías
"trayectoria.cat_experience":    "Experience"    / "Experiencia"
"trayectoria.cat_education":     "Education"     / "Educación"
"trayectoria.cat_certification": "Certification" / "Certificación"
"trayectoria.cat_internship":    "Internship"    / "Prácticas"

// Por item (patrón: trayectoria.item_<id>_<field>)
"trayectoria.item_alsea_title":         "Cook"                                        / "Cocinero"
"trayectoria.item_alsea_org":           "Alsea"
"trayectoria.item_alsea_location":      "León, Castilla y León, Spain"               / "León, Castilla y León, España"
"trayectoria.item_alsea_modality":       "Part-time"                                  / "Jornada parcial"
"trayectoria.item_alsea_detail":        "Time management, teamwork and composure in high-pressure service."

"trayectoria.item_dam_title":           "Higher Technician in Multiplatform App Development (DAM)"
"trayectoria.item_dam_title":           "Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)" // es
"trayectoria.item_dam_org":             "IES San Andrés"
"trayectoria.item_dam_location":        "León, Spain"                                / "León, España"
"trayectoria.item_dam_bullet_1":        "Java, Python and 11+ additional technologies."
"trayectoria.item_dam_bullet_1":        "Java, Python y 11 tecnologías más." // es
"trayectoria.item_dam_bullet_2":        "Programming, databases and multiplatform app development."
"trayectoria.item_dam_bullet_2":        "Programación, bases de datos y desarrollo de aplicaciones multiplataforma." // es
"trayectoria.item_dam_bullet_3":        "Final project: management app with MVC architecture."

"trayectoria.item_leasba_title":        "Software Developer Intern"
"trayectoria.item_leasba_title":        "Desarrollador de software en prácticas" // es
"trayectoria.item_leasba_org":          "Leasba"
"trayectoria.item_leasba_location":     "León, Spain"                                / "León, España"
"trayectoria.item_leasba_modality":      "On-site"                                    / "Presencial"
"trayectoria.item_leasba_bullet_1":     "Developed and adapted the invoicing system to the business's needs."
"trayectoria.item_leasba_bullet_1":     "Desarrollo y adaptación del sistema de facturación según las necesidades del negocio." // es
"trayectoria.item_leasba_bullet_2":     "Specialized in Microsoft Business Central and its AL language."
"trayectoria.item_leasba_bullet_2":     "Especialización técnica en Microsoft Business Central y su lenguaje AL." // es
"trayectoria.item_leasba_bullet_3":     "Customized ERP and designed tailored workflows for clients."
"trayectoria.item_leasba_bullet_3":     "Personalización del ERP y diseño de flujos a medida para clientes." // es

"trayectoria.item_master_title":        "Master's in Android & iOS Development"
"trayectoria.item_master_title":        "Máster en Desarrollo Android y Swift" // es
"trayectoria.item_master_org":          "Tokio School"
"trayectoria.item_master_location":     "Online"
"trayectoria.item_master_bullet_1":     "Native development in Android (Kotlin, Jetpack Compose) and iOS (Swift, SwiftUI)."
"trayectoria.item_master_bullet_1":     "Desarrollo nativo en Android (Kotlin, Jetpack Compose) y iOS (Swift, SwiftUI)." // es
"trayectoria.item_master_bullet_2":     "MVVM, Clean Architecture and reactive patterns."
"trayectoria.item_master_bullet_2":     "Arquitecturas MVVM, Clean Architecture y patrones reactivos." // es
"trayectoria.item_master_bullet_3":     "Final project: sports tracking app with HealthKit and Google Fit integration."

"trayectoria.item_pez_tomillo_title":   "Cook"                                        / "Cocinero"
"trayectoria.item_pez_tomillo_org":     "PEZ TOMILLO SL"
"trayectoria.item_pez_tomillo_location": "Málaga, Andalusia, Spain"                  / "Málaga, Andalucía, España"
"trayectoria.item_pez_tomillo_modality": "Full-time · On-site"                        / "Jornada completa · Presencial"
"trayectoria.item_pez_tomillo_detail":  "Author cuisine in a high-end restaurant. Time management and teamwork."

"trayectoria.item_udon_title":          "Sous Chef"                                   / "Segundo de cocina"
"trayectoria.item_udon_org":            "UDON Asian Food"
"trayectoria.item_udon_location":       "León, Castilla y León, Spain"               / "León, Castilla y León, España"
"trayectoria.item_udon_modality":       "Part-time · On-site"                        / "Jornada parcial · Presencial"
"trayectoria.item_udon_detail":         "Asian cuisine operations in a high-volume franchise."

"trayectoria.item_ibm_ai_title":        "Artificial Intelligence Fundamentals"
"trayectoria.item_ibm_ai_org":          "IBM"
"trayectoria.item_ibm_ai_location":     "Online"
"trayectoria.item_ibm_ai_detail":       "AI fundamentals, machine learning and practical applications."
"trayectoria.item_ibm_ai_detail":       "Fundamentos de IA, machine learning y aplicaciones prácticas." // es

"trayectoria.item_mas_title":           "Frontend Tech Lead (Internship)"
"trayectoria.item_mas_title":           "Frontend Tech Lead (Prácticas)" // es
"trayectoria.item_mas_org":             "MAS Ingeniería"
"trayectoria.item_mas_location":        "Remote"                                      / "Remoto"
"trayectoria.item_mas_modality":        "Full-time"                                  / "Jornada completa"
"trayectoria.item_mas_bullet_1":        "Architecture and development from scratch with a modular, clean and scalable structure."
"trayectoria.item_mas_bullet_1":        "Arquitectura y desarrollo desde cero con estructura modular, limpia y escalable." // es
"trayectoria.item_mas_bullet_2":        "Direct coordination with backend and product to define integration and critical flows."
"trayectoria.item_mas_bullet_2":        "Coordinación directa con backend y producto para definir integración y flujos críticos." // es
"trayectoria.item_mas_bullet_3":        "Designed fluid and reliable UX adapted to business and physical hardware needs."
"trayectoria.item_mas_bullet_3":        "Diseño de UX fluida y fiable adaptada a las necesidades del negocio y del hardware físico." // es

"trayectoria.item_big_school_title":    "Initiation to AI development: programming with agents"
"trayectoria.item_big_school_org":      "BIG school"
"trayectoria.item_big_school_location": "Online"
"trayectoria.item_big_school_detail":   "Certificate in development focused on agentic architectures."
"trayectoria.item_big_school_detail":   "Expedición del certificado en desarrollo enfocado a arquitecturas agenticas." // es

// Nav (renombrar)
"nav.experience": "Journey"  / "Trayectoria"
```

### Keys a eliminar
Todas las `experience.*` actuales (15 keys en, 15 es). Se renombran a `trayectoria.*` con la estructura plana listada arriba.

## 10. Mobile (≤ 768px)

**Decisión**: en mobile la sección se renderiza como **stack vertical** sin pin, sin translateX, sin zigzag.

```ts
const isMobile = useMediaQuery('(max-width: 768px)');
if (isMobile) return <TrayectoriaMobile items={items} />;
```

**`TrayectoriaMobile`** (subcomponente del mismo archivo, o componente separado):
- Sin pin. Sin `gsap.context`.
- `display: flex; flex-direction: column; gap: 24px; padding: 16px;`.
- Cada card a `width: 100%` (no 380px fijo).
- Línea de tiempo vertical a la izquierda con dots, similar a la versión actual de `Experience`.
- Sin variantes milestone/experience visibles (todas se renderizan iguales a `width: 100%`).
- Sin header pinned (es solo un `h2` normal).

## 11. Accesibilidad

- **Reduced motion**: si `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, no se aplica `pin: true`. En su lugar, el contenedor se vuelve un `overflow-x: auto` con `scroll-snap-type: x mandatory` y cada item es un `scroll-snap-align: center`. El usuario hace scroll horizontal con el dedo/ratón de forma nativa.
- **Keyboard**: la sección entera no es focusable (es decorativa), pero el CTA final de LinkedIn sí lo es (`<a>` normal con `target="_blank" rel="noopener noreferrer"`).
- **Screen readers**: el `id="trayectoria"` permite anclaje desde el nav. Cada card tiene un `aria-label` derivado del título y la organización.
- **Contraste**: el glass sobre fondo mesh mantiene contraste suficiente para texto (`text-foreground` y `text-foreground/85`).

## 12. Cambios en archivos

| Archivo | Acción |
|---|---|
| `src/components/sections/Trayectoria.tsx` | **Crear** (componente principal) |
| `src/components/sections/Trayectoria.module.css` | **Crear** (estilos del track, eje, dots) |
| `src/data/trayectoria.ts` | **Crear** (array de 9 items con keys i18n) |
| `src/hooks/useMediaQuery.ts` | **Crear** (hook simple de media query) |
| `src/components/sections/Experience.tsx` | **Eliminar** |
| `src/pages/Index.tsx` | Quitar import y uso de `Experience`. Quitar su `WindowChrome`. Añadir `<Trayectoria />` standalone. |
| `src/i18n/translations.ts` | Renombrar `experience.*` → `trayectoria.*` con la nueva estructura. |

**Sin cambios** en: `useLenis.ts`, `useScrollReveal.ts`, `SectionContainer.tsx`, `WindowChrome.tsx`, todos los demás componentes.

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `pin: true` deja ScrollTriggers huérfanos en HMR | `useLayoutEffect` con `ctx.revert()` al cleanup. Verificar tras cada cambio en dev. |
| 9 cards con `backdrop-filter` (glass) puede ser caro en GPU | `will-change: transform` solo en el track. Las cards individuales no fuerzan capa propia. |
| Mobile: 380px de card no cabe con contexto | Fallback completo a stack vertical con `useMediaQuery`. |
| Pin durante scroll rápido salta | `scrub: 1` + `anticipatePin: 1`. |
| i18n incompleto al desarrollar | Definir TODAS las keys en `translations.ts` antes de renderizar cards. Si una key falta, fallback al string de la key (comportamiento actual de `t()`). |
| Resize de ventana con pin activo | `invalidateOnRefresh: true` recalcula. ScrollTrigger.refresh() en listener de resize. |
| `prefers-reduced-motion` | Override que desactiva pin y permite scroll-snap horizontal nativo. |

## 14. Fuera de alcance

- Modales de detalle por card.
- Drag con ratón (Draggable).
- Animaciones de entrada por card (fade, scale, slide).
- Parallax 3D por card.
- Cambio del sistema de cards de Projects o Education.
- Tema claro (la sección es dark-only como el resto del portfolio).
- Internacionalización a idiomas distintos de es/en.

## 15. Criterios de aceptación

1. La sección aparece entre Profile y Projects en `Index.tsx`, sin `WindowChrome`.
2. El scroll vertical de la página mueve el track horizontal de forma suave.
3. Cuando el top de la sección llega al top del viewport, queda pinned hasta terminar el recorrido horizontal.
4. Las 9 cards se renderizan con la estructura correcta: posición zigzag alternada, eje horizontal central con dots, líneas conectoras verticales.
5. Las cards variant="milestone" miden 380×260px; las variant="experience" miden 380×380px.
6. El header "Mi Trayectoria" permanece visible durante todo el scroll horizontal pinned.
7. El indicador de progreso ("N / 9") se actualiza según la posición del scroll.
8. La última card del track es un CTA a LinkedIn.
9. En mobile (≤ 768px), la sección se renderiza como stack vertical sin pin.
10. Con `prefers-reduced-motion: reduce`, no hay pin; scroll horizontal nativo con snap.
11. Las traducciones es/en funcionan: cambiar el idioma actualiza todos los strings.
12. La sección no rompe el scroll con la siguiente (Projects): tras terminar el recorrido horizontal, el scroll vertical continúa con normalidad.
13. `npm run lint` y `npm test` pasan sin errores.
14. `npm run build` compila sin warnings.
