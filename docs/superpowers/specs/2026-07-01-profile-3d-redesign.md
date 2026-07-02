# Spec — Rediseño sección Profile con scroll-jack 3D

- **Fecha**: 2026-07-01
- **Estado**: Spec pendiente de aprobación del usuario
- **Origen**: `BRAINSTORM-profile-3d-2026-07-01.md` (raíz del proyecto)
- **Opción elegida**: B — Sticky scroll-jacked con `ScrollControls` + GSAP timeline

---

## 1. Resumen ejecutivo

Reemplazar la sección `Profile` actual (`src/components/sections/Profile.tsx`) por una sección scroll-jacked que recorre las tres pasiones del usuario — **cocina**, **videojuegos** y **música** — con un objeto 3D renderizado en r3f por pasión, animados al hacer scroll. Mantiene la estética `WindowChrome` (mobile fallback) y la pipeline i18n.

**Migración de stack previa**: r3f 8.18 → 9.6.1, drei 9.122 → 10.7.7 (versiones estables abril 2026).

---

## 2. Objetivos y no-objetivos

### Objetivos

- Una sola escena 3D compartida para las 3 pasiones (coste de GPU único).
- Scroll vertical natural controla una línea de tiempo GSAP → movimiento de cámara + cross-fade de modelos + opacity de texto.
- Mobile fallback a 3 cards apiladas (mismos modelos, sin scroll-jack).
- Cumplir `prefers-reduced-motion: reduce` con fallback a cards estáticas sin canvas.
- Mantener pipeline i18n con 4 idiomas (ES, EN, CA, GL).
- No romper accesibilidad del nav (anclas funcionan, keyboard navega).

### No-objetivos

- No se añaden más pasiones (YAGNI).
- No se reemplaza la imagen de fondo Pexels.
- No se reescribe el `WindowChrome` ni `HeroShowcase`.
- No se introduce WebGPU (queda en WebGL2).
- No se reescribe el sistema i18n: se añaden keys nuevas al namespace `profile`.

---

## 3. Arquitectura

### 3.1 Vista global de componentes

```
src/
├── pages/
│   └── Index.tsx                         (modificado: importa ProfileShowcase en lugar de Profile)
├── components/
│   ├── sections/
│   │   ├── Profile.tsx                   (eliminado, contenido migrado)
│   │   └── ProfileShowcase.tsx           (nuevo: orquesta desktop + mobile fallback)
│   ├── three/
│   │   ├── ProfileScene.tsx              (nuevo: escena r3f completa)
│   │   ├── ProfileCamera.tsx             (nuevo: trayectoria CatmullRom)
│   │   ├── ProfileModels.tsx             (nuevo: 3 modelos individuales)
│   │   ├── ProfileLights.tsx             (nuevo: 3 setups de luz)
│   │   ├── ProfilePostFX.tsx             (nuevo: EffectComposer selectivo)
│   │   └── Hero3D.tsx                    (sin tocar, referencia de estilo)
│   ├── ui/
│   │   └── ProfileMobileFallback.tsx     (nuevo: 3 cards apiladas para <md)
│   └── window/
│       └── WindowChrome.tsx              (sin tocar, usado en mobile fallback)
├── hooks/
│   ├── useProfileScroll.ts               (nuevo: helpers de progreso)
│   └── useDeviceTier.ts                  (nuevo: detección mobile + reduced-motion + GPU)
├── lib/
│   └── profile-content.ts                (nuevo: tipos + orden de pasiones, sin texto i18n)
├── i18n/
│   └── locales/{es,en,ca,gl}/translation.json   (modificado: nuevos keys)
└── public/
    └── models/
        └── profile/
            ├── chef-hat.glb              (nuevo: descargado o AI-generado)
            ├── gamepad.glb               (nuevo: descargado)
            └── keyboard.glb              (nuevo: descargado)
```

### 3.2 Dependencias

- `npm i @react-three/fiber@^9.6.1 @react-three/drei@^10.7.7`
- `@react-three/postprocessing@^2.x` (si no está, se añade)
- `three` se mantiene en 0.185 (compatible con r3f 9 y drei 10)

### 3.3 Render del `Index.tsx`

```tsx
<WindowChrome title="~/passions.md" id="profile" className="max-w-none w-full">
  <ProfileShowcase />
</WindowChrome>
```

El `WindowChrome` queda como contenedor exterior (consistente con el resto). En desktop el `ProfileShowcase` ocupa todo el alto del chrome con su propio canvas; en móvil, `ProfileShowcase` renderiza 3 cards con su propio chrome interior.

---

## 4. Diseño detallado

### 4.1 `ProfileShowcase` — orquestador

```tsx
'use client';
import { ProfileScene } from '@/components/three/ProfileScene';
import { ProfileMobileFallback } from '@/components/ui/ProfileMobileFallback';
import { useDeviceTier } from '@/hooks/useDeviceTier';

export function ProfileShowcase() {
  const { isMobile, prefersReducedMotion, gpuTier } = useDeviceTier();

  if (isMobile || prefersReducedMotion || gpuTier === 'low') {
    return <ProfileMobileFallback />;
  }
  return <ProfileScene />;
}
```

### 4.2 `ProfileScene` — canvas con ScrollControls

- `<Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 6], fov: 45 }}>`
- `<ScrollControls pages={3} damping={0.25} maxSpeed={1.2}>`
  - `<Scroll>` con altura 100% del padre × 3
  - `<ProfileCamera />` lee `useScroll().offset` y posiciona la cámara en una CatmullRomCurve3
  - `<ProfileModels />` recibe `offset` y decide qué modelo está visible (visible = `1 - Math.abs(offset - t) < 0.4`)
  - `<ProfileLights />` interpola color de luz entre los 3 setups según `offset`
- `<ProfilePostFX />` con `Bloom` (selective) + `Vignette`
- `<Suspense fallback={null}>` envolviendo los modelos

Fuera del `<Canvas>`, overlay HTML con `<ProfileText />` que sincroniza su contenido/opacity con `useScroll().offset` vía un `subscribe` a `state.scroll`.

### 4.3 `ProfileCamera` — trayectoria CatmullRom

3 puntos de control en un arco alrededor del origen:

| t | Posición | LookAt | Pasión |
|---|---|---|---|
| 0.0 | (0, 0.5, 5) | (0, 0, 0) | Cocina |
| 0.5 | (-3, -0.5, 4) | (0, 0, 0) | Videojuegos |
| 1.0 | (2, 1, 5) | (0, 0, 0) | Música |

Curva cerrada con `closed=true` para que el orbit envuelva los 3 modelos. En cada modelo se aplica un micro-orbit local (rotación 15° en Y basada en `Math.sin(t * Math.PI * 2)`).

```tsx
const curve = useMemo(() => new THREE.CatmullRomCurve3(
  [v0, v1, v2, v0.clone().add(perp)],  // 4to punto cierra la curva
  true, 'catmullrom', 0.5
), []);

useFrame(({ camera }) => {
  if (!scroll) return;
  const t = scroll.offset;
  const pos = curve.getPointAt(t);
  const tan = curve.getTangentAt(t);
  camera.position.lerp(pos, 0.1);
  camera.lookAt(0, 0, 0);
});
```

### 4.4 `ProfileModels` — los 3 modelos

```tsx
function ProfileModels({ offset }: { offset: number }) {
  const chefVisible = useVisibility(offset, 0.0, 0.5);
  const gameVisible = useVisibility(offset, 0.5, 0.5);
  const musicVisible = useVisibility(offset, 1.0, 0.5);

  return (
    <Suspense fallback={null}>
      <ChefHatModel visible={chefVisible} />
      <ControllerModel visible={gameVisible} />
      <KeyboardModel visible={musicVisible} />
    </Suspense>
  );
}
```

Cada `*Model` componente:

```tsx
function ChefHatModel({ visible }: { visible: number }) {
  const { nodes, materials } = useGLTF('/models/profile/chef-hat.glb');
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    ref.current.scale.setScalar(0.001 + visible * 1.2);  // collapse cuando invisible
  });
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={ref} visible={visible > 0.05}>
        <primitive object={nodes.ChefHat} />
      </group>
    </Float>
  );
}
useGLTF.preload('/models/profile/chef-hat.glb');
```

### 4.5 `ProfileLights`

3 setups interpolados:

| t | Ambient | Directional | PointLight (color) |
|---|---|---|---|
| 0.0 (cocina) | warm 0.3 | warm white 1.0 | hsl(25 90% 60%) |
| 0.5 (gaming) | cool 0.2 | white 0.8 | hsl(150 70% 55%) |
| 1.0 (música) | violet 0.2 | white 0.7 | hsl(280 80% 65%) |

Interpolación lineal entre los 3 setups con `THREE.Color.lerp`.

### 4.6 `ProfilePostFX`

```tsx
<EffectComposer>
  <Bloom mipmapBlur luminanceThreshold={1} intensity={0.6} />
  <Vignette eskil={false} offset={0.15} darkness={0.6} />
</EffectComposer>
```

Solo se renderiza en desktop. Materiales emisivos llevan `toneMapped={false}` para que el Bloom los detecte.

### 4.7 `ProfileText` — overlay HTML

```tsx
export function ProfileText() {
  const { t } = useLanguage();
  const scroll = useScroll();
  const [index, setIndex] = useState(0);

  useFrame(() => {
    const next = Math.round(scroll.offset * 2);
    if (next !== index) setIndex(next);
  });

  const passions = ['cooking', 'gaming', 'music'];
  return (
    <Html ...portal>  {/* drei Html para que respete la cámara */}
      <div className="profile-text-overlay">
        {passions.map((p, i) => (
          <article key={p} hidden={i !== index}>
            <h2>{t(`profile.passion.${p}.title`)}</h2>
            <p>{t(`profile.passion.${p}.body`)}</p>
          </article>
        ))}
      </div>
    </Html>
  );
}
```

Si `Html` portal no encaja visualmente, alternativa: posicionar el texto fuera del `<Canvas>` con `useFrame` externo que actualice un `ref` con el `offset` actual.

### 4.8 `ProfileMobileFallback` — cards apiladas

3 cards con grid `grid-cols-1 md:hidden`, cada una con:

- `<WindowChrome>` con título `~/cooking.md` / `~/gaming.md` / `~/music.md`
- `<Canvas dpr={[1, 1.25]}>` con `frameloop="demand"` + `PerformanceMonitor`
- Solo el modelo de esa pasión
- Mouse-look desactivado (no tiene sentido en touch)
- `Float` con intensidad reducida

Sin `<ScrollControls>`. Scroll vertical normal.

### 4.9 `useDeviceTier` — detección

```ts
export function useDeviceTier(): {
  isMobile: boolean;
  prefersReducedMotion: boolean;
  gpuTier: 'low' | 'mid' | 'high';
} {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const detected = useDetectGPU(); // de drei
  const gpuTier = detected?.tier === 0 ? 'low' : detected?.tier === 1 ? 'mid' : 'high';
  return { isMobile, prefersReducedMotion, gpuTier };
}
```

### 4.10 Hook `useProfileScroll` (opcional)

Wrapper sobre `useScroll` que expone `t` (offset), `velocity`, y un valor booleano `isTransitioning` (true si |delta| > epsilon). Usado por `ProfileText` para no actualizar React state en cada frame.

### 4.11 `lib/profile-content.ts`

```ts
export const PROFILE_PASSIONS = ['cooking', 'gaming', 'music'] as const;
export type ProfilePassion = typeof PROFILE_PASSIONS[number];

export interface PassionMeta {
  key: ProfilePassion;
  windowTitle: string;        // '~/cooking.md'
  lightColor: { h: number; s: number; l: number };
  accentVar: string;          // CSS var para la card
  ariaLabel: string;          // 'Pasión: cocina'
}

export const PASSION_META: Record<ProfilePassion, PassionMeta> = {
  cooking: {
    key: 'cooking',
    windowTitle: '~/cooking.md',
    lightColor: { h: 25, s: 90, l: 60 },
    accentVar: '--shadow-glow-accent',
    ariaLabel: 'Pasión: cocina',
  },
  gaming: {
    key: 'gaming',
    windowTitle: '~/gaming.md',
    lightColor: { h: 150, s: 70, l: 55 },
    accentVar: '--primary-glow',
    ariaLabel: 'Pasión: videojuegos',
  },
  music: {
    key: 'music',
    windowTitle: '~/music.md',
    lightColor: { h: 280, s: 80, l: 65 },
    accentVar: '--primary',
    ariaLabel: 'Pasión: música',
  },
};
```

---

## 5. Datos e i18n

### 5.1 Keys nuevos

Bajo namespace `profile.*`:

| Key | Tipo | Descripción |
|---|---|---|
| `profile.section_label` | string | "Pasiones" / "Passions" |
| `profile.section_title` | string | Heading principal |
| `profile.passion.cooking.label` | string | "Cocina" |
| `profile.passion.cooking.title` | string | H2 de la pasión |
| `profile.passion.cooking.body` | string | Párrafo principal (3-4 frases) |
| `profile.passion.gaming.*` | mismas 3 keys | |
| `profile.passion.music.*` | mismas 3 keys | |
| `profile.fallback.chef_alt` | string | "Gorro de chef" (aria/alt) |
| `profile.fallback.gamepad_alt` | string | "Mando de PlayStation" |
| `profile.fallback.keyboard_alt` | string | "Teclado sintetizador" |

### 5.2 Borrador del copy (a validar por el usuario)

> ES, EN, CA, GL. Tono: íntimo, en primera persona, sin pomposidad. Inspirado en el briefing del usuario.

**ES**

- `profile.section_title`: "Lo que me hace quien soy"
- `profile.passion.cooking.title`: "Donde aprendí a tener paciencia"
- `profile.passion.cooking.body`: "Donde empecé a currar para pagar mis estudios. Cuchillos, fuego, gente alrededor de la mesa. Lo que me enseñó a cuidar los detalles, a tener paciencia y a querer a los míos desde la cocina."
- `profile.passion.gaming.title`: "Mi sitio seguro"
- `profile.passion.gaming.body`: "El lugar donde bajo el volumen del mundo. Horas que me han dado nostalgia, aprendizaje, amistades y una forma de entender las narrativas que después aplico a todo."
- `profile.passion.music.title`: "La constancia convertida en oficio"
- `profile.passion.music.body`: "La pasión que me ha acompañado siempre. Producción musical, rodearme de gente como Samu, de la que aprendí y me inspiré. Donde más he sentido que la constancia se convierte en oficio."

**EN**

- `section_title`: "What makes me who I am"
- `cooking.title`: "Where I learned to be patient"
- `cooking.body`: "Where I started working to pay for my studies. Knives, fire, people around the table. What taught me to care for the details, to be patient, and to love the people in my life from the kitchen."
- `gaming.title`: "My safe place"
- `gaming.body`: "Where I lower the volume of the world. Hours that gave me nostalgia, learning, friendships, and a way of understanding narratives that I then apply to everything."
- `music.title`: "Consistency turned into craft"
- `music.body`: "The passion that's always been with me. Music production, surrounding myself with people like Samu, from whom I learned and was inspired. Where I've felt most that consistency becomes craft."

**CA**

- `section_title`: "El que em fa ser qui sóc"
- `cooking.title`: "On vaig aprendre a tenir paciència"
- `cooking.body`: "On vaig començar a treballar per pagar els estudis. Ganivets, foc, gent al voltant de la taula. El que m'ha ensenyat a cuidar els detalls, a tenir paciència i a estimar la gent des de la cuina."
- `gaming.title`: "El meu lloc segur"
- `gaming.body`: "On baixo el volum del món. Hores que m'han donat nostàlgia, aprenentatge, amistats i una manera d'entendre les narratives que després aplico a tot."
- `music.title`: "La constància convertida en ofici"
- `music.body`: "La passió que m'ha acompanyat sempre. Producció musical, envoltar-me de gent com el Samu, de qui vaig aprendre i em vaig inspirar. On més he sentit que la constància es converteix en ofici."

**GL**

- `section_title`: "O que me fai ser quen son"
- `cooking.title`: "Onde aprendín a ter paciencia"
- `cooking.body`: "Onde empecei a traballar para pagar os estudos. Coitelas, lume, xente arredor da mesa. O que me ensinou a coidar os detalles, a ter paciencia e a querer á miña xente desde a cociña."
- `gaming.title`: "O meu sitio seguro"
- `gaming.body`: "Onde baixo o volume do mundo. Horas que me deron nostalxia, aprendizaxe, amizades e unha forma de entender as narrativas que logo aplico a todo."
- `music.title`: "A constancia convertida en oficio"
- `music.body`: "A paixón que me acompañou sempre. Produción musical, rodearme de xente como Samu, da que aprendín e me inspirei. Onde máis sentín que a constancia se convirte en oficio."

---

## 6. Estrategia de assets

### 6.1 Pipeline

1. **Selección inicial** (commits como binarios en `public/models/profile/`):
   - `chef-hat.glb`: Sketchfab "Peppino Chef Hat" by Greg Lynch (1.4k tris, CC-BY) o, si se ve flojo, regenerar con Meshy Free prompt: *"stylized white chef chef toque, low-poly, flat shading, single object, no background"*.
   - `gamepad.glb`: Sketchfab "PS5 Controller" by Taohid Animation (104k tris, CC-BY). Optimizar con `gltf-transform optimize` (Draco + Meshopt) → ~300 KB.
   - `keyboard.glb`: CGTrader "Realistic Digital Keyboard with Stand" (Royalty Free, glTF 4.68 MB). Optimizar → ~1.5 MB.
2. **Conversión a GLB Draco-compressed** con `gltfpack` o `@gltf-transform/cli`:
   ```bash
   npx gltfpack -i chef-hat.gltf -o public/models/profile/chef-hat.glb -cc -tc
   ```
3. **Preload** via `useGLTF.preload()` en el `useEffect` de `ProfileScene`.
4. **Atribuciones** en `src/lib/attributions.ts` + `<Attributions>` discreto (botón `?` en el chrome que muestra un modal con los créditos).

### 6.2 Licencias y atribución

- Sketchfab CC-BY: mantener el nombre del autor visible.
- CGTrader Royalty Free: redistribución sin restricción.
- Meshy Free: CC-BY con atribución a Meshy + autor del prompt.

---

## 7. Accesibilidad

| Criterio | Implementación |
|---|---|
| `prefers-reduced-motion: reduce` | `ProfileMobileFallback` sin canvas; cards estáticas con `prefers-reduced-motion` también en CSS para eliminar `Float` y transiciones largas. |
| Teclado | `Tab` recorre los anchors de nav. Dentro de la sección, no hay elementos focuseables. El canvas tiene `tabIndex={-1}` y `aria-label="Escena 3D de pasiones"`. |
| Lector de pantalla | Texto HTML semántico (`<article>`, `<h2>`, `<p>`) siempre presente, no dentro del canvas. aria-live="polite" anuncia la pasión activa cuando cambia. |
| Touch | En desktop el scroll-jack usa `ScrollControls` que ya soporta touch swipe. En mobile fallback, scroll vertical natural. |
| Contraste | Texto blanco/foreground sobre fondo oscuro. Cumple WCAG AA. |
| Alternativa no-3D | Mobile fallback + reduced motion ya lo cubren. |

---

## 8. Performance

| Aspecto | Estrategia |
|---|---|
| Dpr | `[1, 1.5]` en desktop, `[1, 1.25]` en mobile |
| `frameloop` | `"always"` desktop, `"demand"` mobile |
| Postprocessing | Solo desktop, `Bloom` con `mipmapBlur` (más rápido) |
| Modelos | Draco + Meshopt, `<=2 MB` total. Preload al inicio. |
| Texturas | KTX2 si están disponibles en el glb, si no PNG |
| GPU detection | `useDetectGPU` de drei para degradar a mobile fallback si tier === 0 |
| CPU | `useFrame` solo actualiza cámara, modelo activo y luces. Modelos no activos con `visible={false}`. |
| Bundle | Mantener fuera de los chunks principales: cargar `ProfileScene` con `React.lazy`. |

### Métricas objetivo

- 60 FPS en MacBook M1 / Chrome.
- 30+ FPS en iPhone 13 / Safari.
- TTI de la sección < 200 ms (modelos preloaded).
- Bundle del chunk lazy < 300 KB gzipped.

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Migración r3f 8→9 / drei 9→10 introduce breaking changes | Smoke test post-migración: que el Hero 3D siga funcionando. Rollback inmediato si falla. |
| `ScrollControls` + `Lenis` coexisten mal | Desactivar Lenis dentro de la sección via `lenis.stop()` / `lenis.start()` en el mount/unmount de `ProfileShowcase`. |
| Modelos descargados se ven mal estéticamente | Plan B: AI-generar el flojo con Meshy Free. Plan C: substituir por procedural. |
| Performance cae en móvil | `useDeviceTier` degrada a mobile fallback automáticamente. |
| CC-BY atribución incompleta | Modal de atribuciones visible + commit con `NOTICE` file listando los assets y autores. |
| i18n incompleto en algún idioma | TypeScript type check: `TranslationKeys` debe incluir las nuevas keys en los 4 locales. CI fail si falta. |

---

## 10. Testing

### 10.1 Unit tests (Vitest)

- `useDeviceTier`: mock de media queries, valida el tier retornado.
- `useProfileScroll`: mock de `useScroll`, valida `t`, `velocity`, `isTransitioning`.
- `lib/profile-content`: snapshot de `PASSION_META`.

### 10.2 Component tests (Vitest + Testing Library)

- `ProfileMobileFallback`: renderiza con 3 cards en viewport móvil. Sin `<Canvas>`.
- `ProfileShowcase`: con `prefersReducedMotion=true`, renderiza fallback.

### 10.3 Manual QA checklist

- [ ] Hero 3D sigue funcionando tras la migración de stack.
- [ ] Sección Profile carga los 3 modelos en < 1 s.
- [ ] Scroll sync: la cámara sigue la curva, los modelos cambian en el offset correcto.
- [ ] Cross-fade suave entre modelos (sin popping).
- [ ] Texto overlay cambia con la pasión activa.
- [ ] Luces interpolan correctamente.
- [ ] Mobile fallback: 3 cards apiladas, scroll vertical, cada modelo se ve.
- [ ] `prefers-reduced-motion: reduce`: sin canvas, cards estáticas.
- [ ] Anclas: `#profile` salta al inicio de la sección.
- [ ] Cambio de tema (catppuccin/dracula/tokyo-night) recolorea correctamente.
- [ ] Lint, type-check, build, tests pasan.

---

## 11. Plan de implementación (resumen)

1. **Migración de stack**: `npm i r3f 9.6.1 + drei 10.7.7`. Smoke test del Hero 3D. ~30 min.
2. **Assets**: descargar 3 GLBs, optimizar con `gltfpack`, colocarlos en `public/models/profile/`. Crear `lib/attributions.ts`. ~1 h.
3. **i18n keys**: añadir las nuevas keys a los 4 `translation.json`. Type-check. ~20 min.
4. **`lib/profile-content.ts`**: tipos + meta. ~15 min.
5. **`hooks/useDeviceTier.ts`**: detección. ~20 min.
6. **`three/ProfileModels.tsx`**: 3 componentes modelo + `useGLTF.preload`. ~45 min.
7. **`three/ProfileCamera.tsx`**: CatmullRom. ~30 min.
8. **`three/ProfileLights.tsx`**: 3 setups interpolados. ~30 min.
9. **`three/ProfilePostFX.tsx`**: EffectComposer. ~15 min.
10. **`three/ProfileScene.tsx`**: orquesta todo. ~45 min.
11. **`sections/ProfileShowcase.tsx` + `three/ProfileText.tsx`**: orquestación + overlay HTML. ~1 h.
12. **`ui/ProfileMobileFallback.tsx`**: cards para móvil. ~45 min.
13. **`pages/Index.tsx`**: swap `Profile` → `ProfileShowcase`. ~5 min.
14. **Tests**: unit + component. ~45 min.
15. **Manual QA + ajuste fino**: 1 h.

**Total estimado**: ~8-9 h de trabajo concentrado (1 sesión larga o 2 sesiones medias).

---

## 12. Criterios de aceptación

- [ ] Las 3 pasiones se muestran con su objeto 3D correspondiente (gorro chef, mando PS5, teclado MIDI).
- [ ] En desktop, el scroll sincroniza cámara + modelo + texto + luces.
- [ ] En mobile (<md), se muestran 3 cards apiladas con su modelo 3D individual.
- [ ] `prefers-reduced-motion: reduce` muestra cards estáticas sin canvas.
- [ ] 4 idiomas (ES, EN, CA, GL) con el copy validado.
- [ ] Atribuciones CC-BY visibles.
- [ ] Lint + type-check + tests + build pasan en verde.
- [ ] 60 FPS en desktop, 30+ FPS en móvil gama media.
- [ ] El Hero 3D no se rompe con la migración de stack.

---

## 13. Próximo paso

Si apruebas este spec, invoco el skill `writing-plans` para descomponer en tareas ejecutables y empezar.
