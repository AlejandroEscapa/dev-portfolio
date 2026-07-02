# Profile 3D Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la sección `Profile` con un scroll-jack 3D que recorre 3 pasiones (cocina, videojuegos, música), con mobile fallback y respetando i18n, accesibilidad y performance.

**Architecture:** r3f + drei con `ScrollControls` + GSAP timeline + CatmullRom camera path. 3 GLBs en `public/models/profile/`. `useDeviceTier` degrada a 3 cards apiladas en mobile / reduced-motion / GPU low.

**Tech Stack:** React 18.3, TypeScript 5.8, Vite 5.4, Tailwind v4, r3f 9.6.1, drei 10.7.7, three 0.185, GSAP 3.15, framer-motion 12.38, lucide-react, i18next.

**Spec:** `docs/superpowers/specs/2026-07-01-profile-3d-redesign.md`

## Global Constraints

- Node + npm (no bun). Stack 3D estable: r3f 9.6.1, drei 10.7.7, three 0.185 (NO v10 alpha).
- Mobile breakpoint: < 768px. Scroll-jack solo en ≥768px.
- i18n: 4 idiomas (ES, EN, CA, GL) — TODAS las keys nuevas en los 4.
- `prefers-reduced-motion: reduce` → fallback a cards estáticas sin canvas.
- Lenis debe desactivarse dentro de la sección (ScrollControls usa su propio scroll).
- TypeScript: strict está OFF pero nuevos archivos deben ser correctos.
- `noUnusedLocals` y `noUnusedParameters` están OFF, pero evitar basura.
- shadcn components solo vía CLI, no se añaden nuevos para esta feature.
- Commit frecuente con conventional commits.

---

## File Map

**Crear:**
- `src/lib/profile-content.ts` — tipos, `PROFILE_PASSIONS`, `PASSION_META`
- `src/hooks/useDeviceTier.ts` — `isMobile`, `prefersReducedMotion`, `gpuTier`
- `src/hooks/useProfileScroll.ts` — wrapper sobre `useScroll` con `t`, `velocity`, `isTransitioning`
- `src/components/three/ProfileScene.tsx` — Canvas + ScrollControls + orquesta 3D
- `src/components/three/ProfileCamera.tsx` — CatmullRom camera path
- `src/components/three/ProfileModels.tsx` — 3 modelos con `useGLTF` y visibility logic
- `src/components/three/ProfileLights.tsx` — 3 setups interpolados
- `src/components/three/ProfilePostFX.tsx` — EffectComposer
- `src/components/three/ProfileText.tsx` — HTML overlay sincronizado con scroll
- `src/components/three/ProfileProceduralModels.tsx` — modelos procedurales como fallback
- `src/components/sections/ProfileShowcase.tsx` — orquesta desktop + mobile fallback
- `src/components/ui/ProfileMobileFallback.tsx` — 3 cards apiladas
- `src/lib/attributions.ts` — créditos CC-BY
- `public/models/profile/chef-hat.glb` — si descarga OK
- `public/models/profile/gamepad.glb` — si descarga OK
- `public/models/profile/keyboard.glb` — si descarga OK
- `src/hooks/useDeviceTier.test.ts`
- `src/lib/profile-content.test.ts`
- `src/components/sections/ProfileShowcase.test.tsx`

**Modificar:**
- `package.json` — subir r3f y drei, añadir postprocessing si falta
- `src/pages/Index.tsx` — swap `Profile` → `ProfileShowcase`, cambiar title a `~/passions.md`
- `src/i18n/locales/es/translation.json` — añadir 12 keys nuevas
- `src/i18n/locales/en/translation.json` — añadir 12 keys nuevas
- `src/i18n/locales/ca/translation.json` — añadir 12 keys nuevas
- `src/i18n/locales/gl/translation.json` — añadir 12 keys nuevas
- `src/index.css` — utilities para ProfileShowcase (si necesarias)

**Eliminar (al final):**
- `src/components/sections/Profile.tsx` — reemplazado por `ProfileShowcase`

---

## Task 0: Stack migration smoke test

**Files:** `package.json`

- [ ] Actualizar `package.json`:
  - `@react-three/fiber`: `^8.18.0` → `^9.6.1`
  - `@react-three/drei`: `^9.122.0` → `^10.7.7`
  - Añadir `@react-three/postprocessing`: `^2.16.5` (última estable)
- [ ] `npm install` (no `npm i`, mantener consistencia con scripts)
- [ ] Verificar que `npm run dev` arranca y el Hero 3D (`Icosahedron` wireframe) sigue renderizando
- [ ] Verificar que `npm run lint` pasa en archivos del Hero 3D
- [ ] Verificar que `npm run build` compila
- [ ] Si falla: revertir a 8.18/9.122 y abortar migración (riesgo: ningún cambio estructural, la feature funciona igual con v8/v9)

**Commit:** `chore(deps): upgrade r3f to 9.6.1 + drei to 10.7.7 + add postprocessing`

---

## Task 1: Tipos, hooks, attributions, i18n (paralelo)

### 1a. `src/lib/profile-content.ts`

Crear tipos y metadata de las 3 pasiones (light color, aria label, etc). Sin texto i18n dentro. Ver spec §4.11.

- [ ] Crear el archivo
- [ ] Exportar `PROFILE_PASSIONS`, `ProfilePassion`, `PassionMeta`, `PASSION_META`
- [ ] Verificar type-check pasa

### 1b. `src/hooks/useDeviceTier.ts`

Hook que combina `useMediaQuery` (mobile), `prefers-reduced-motion`, y `useDetectGPU` de drei.

- [ ] Crear el archivo
- [ ] Implementar la detección
- [ ] Verificar type-check pasa

### 1c. `src/hooks/useProfileScroll.ts`

Wrapper sobre `useScroll` de drei. Devuelve `{ t, velocity, isTransitioning }`.

- [ ] Crear el archivo
- [ ] Implementar con throttling via subscribe (no re-render en cada frame)
- [ ] Verificar type-check pasa

### 1d. `src/lib/attributions.ts`

Tabla de atribuciones CC-BY. Inicialmente vacía si no se descargan modelos, con estructura lista.

- [ ] Crear el archivo con la estructura de datos
- [ ] Comentario con la lista de autores a rellenar

### 1e. i18n keys (4 archivos en paralelo)

Añadir 12 keys nuevas × 4 locales:

```
profile.section_label: "Pasiones" / "Passions" / "Passions" / "Pasións"
profile.section_title: (borrador del spec, validar con usuario)
profile.passion.cooking.label: "Cocina" / "Cooking" / "Cuina" / "Cociña"
profile.passion.cooking.title: (borrador)
profile.passion.cooking.body: (borrador)
profile.passion.gaming.label: "Videojuegos" / "Gaming" / "Videojocs" / "Videojogos"
profile.passion.gaming.title: (borrador)
profile.passion.gaming.body: (borrador)
profile.passion.music.label: "Música" / "Music" / "Música" / "Música"
profile.passion.music.title: (borrador)
profile.passion.music.body: (borrador con el copy actualizado: "gente como Samu, de la que aprendí y me inspiré")
profile.fallback.chef_alt: "Gorro de chef" / "Chef hat" / ...
profile.fallback.gamepad_alt: "Mando de PlayStation" / "PlayStation controller" / ...
profile.fallback.keyboard_alt: "Teclado sintetizador" / "Synthesizer keyboard" / ...
```

- [ ] Actualizar `src/i18n/locales/es/translation.json` con las 12 keys
- [ ] Actualizar `src/i18n/locales/en/translation.json` con las 12 keys
- [ ] Actualizar `src/i18n/locales/ca/translation.json` con las 12 keys
- [ ] Actualizar `src/i18n/locales/gl/translation.json` con las 12 keys
- [ ] Verificar type-check pasa (TypeScript debe inferir las keys de los JSON)

**Commit:** `feat(profile-3d): add content types, device tier, scroll hook, i18n keys`

---

## Task 2: Assets 3D

### 2a. Attempt downloads

- [ ] Intentar descarga de:
  - Chef hat: `https://sketchfab.com/3d-models/peppino-chef-hat-645c9f7928f040f7a0b06ee2e17d0792` (requiere download token, probablemente falla)
  - Gamepad: `https://sketchfab.com/3d-models/ps5-controller-b7bb9c5102a04cb0b1966c6d02bad7d6`
  - Keyboard: `https://www.cgtrader.com/3d-models/electronics/audio/realistic-digital-keyboard-with-stand` (requiere download)
- [ ] Si la descarga directa falla, **no perder tiempo** en paywalls. Saltar a 2b.

### 2b. Procedural fallback (modelos in-code)

Si no hay modelos externos, construir los 3 modelos proceduralmente con `three.js` primitivas:

- `ChefHatModel`: `CylinderGeometry` para la base + 3 esferas escalonadas para la corona. Material `MeshStandardMaterial` blanco, `roughness: 0.6`.
- `ControllerModel`: 2 cajas curvas (`RoundedBox` de drei) para los grips + caja central + cilindros pequeños para sticks/buttons. Material `MeshStandardMaterial` negro mate, `roughness: 0.4`.
- `KeyboardModel`: caja base con `RoundedBox` + array de mini-cajas para las teclas + 4 cilindros para los knobs. Material `MeshStandardMaterial` gris oscuro + blanco para teclas.

- [ ] Implementar `ProfileProceduralModels.tsx` con los 3 componentes
- [ ] Verificar que cada uno se ve distintivo (comentario que explica la elección de diseño)

### 2c. Optimización (si se descargaron modelos)

- [ ] Si hay modelos descargados, intentar comprimir con `gltfpack` (no bloqueante)

**Commit:** `feat(profile-3d): add 3D models (procedural or downloaded)`

---

## Task 3: 3D core components

### 3a. `ProfileCamera.tsx`

CatmullRom curve 3D, lerp de posición, lookAt al origen. 3 puntos de control que pasan por cocina, gaming, música.

- [ ] Crear el archivo
- [ ] Implementar la curva + useFrame
- [ ] Verificar visualmente que la cámara se mueve (manual)

### 3b. `ProfileModels.tsx`

3 componentes modelo (deliverable de Task 2). Lógica de visibilidad basada en `offset`:
- `visible(offset, target, width) = max(0, 1 - abs(offset - target) / width)`

- [ ] Crear el archivo
- [ ] Implementar `useVisibility` helper
- [ ] Implementar los 3 modelos con `Float` + rotación lenta
- [ ] `useGLTF.preload()` para los 3 (si son GLB)

### 3c. `ProfileLights.tsx`

3 setups de luz interpolados según `offset`.

- [ ] Crear el archivo
- [ ] Implementar con `THREE.Color.lerp`

### 3d. `ProfilePostFX.tsx`

EffectComposer con `Bloom` (selective) + `Vignette`.

- [ ] Crear el archivo
- [ ] Verificar que `Bloom.mipmapBlur` está habilitado
- [ ] Materiales emisivos de los modelos llevan `toneMapped={false}`

**Commit:** `feat(profile-3d): add camera, models, lights, postprocessing`

---

## Task 4: Scene + Showcase

### 4a. `ProfileScene.tsx`

`<Canvas>` + `<ScrollControls pages={3}>` + `<ProfileCamera>` + `<ProfileModels>` + `<ProfileLights>` + `<ProfilePostFX>` + `<ProfileText>`.

- [ ] Crear el archivo
- [ ] Configurar `dpr={[1, 1.5]}`, `alpha: true`, `antialias: true`
- [ ] Envolver con `<Suspense fallback={null}>`
- [ ] Verificar que compila y renderiza (manual)

### 4b. `ProfileText.tsx`

Overlay HTML sincronizado con scroll offset. 3 articles (uno por pasión), solo el activo visible.

- [ ] Crear el archivo
- [ ] Implementar con `useFrame` + state discreto
- [ ] aria-live="polite" para anunciar pasión activa
- [ ] Estilos en `src/index.css` (utility `.profile-text-overlay`)

### 4c. `ProfileShowcase.tsx`

Componente raíz. Decide desktop vs mobile fallback.

- [ ] Crear el archivo
- [ ] Implementar la lógica de selección (mobile/reduced-motion/gpu-low → fallback)
- [ ] Coordinar con Lenis: `lenis.stop()` en mount, `lenis.start()` en unmount

**Commit:** `feat(profile-3d): add scene orchestrator and showcase`

---

## Task 5: Mobile fallback

### 5a. `ProfileMobileFallback.tsx`

3 cards con `WindowChrome` cada una, scroll vertical normal.

- [ ] Crear el archivo
- [ ] 3 cards con título `~/cooking.md`, `~/gaming.md`, `~/music.md`
- [ ] Cada card con su `<Canvas>` individual (frameloop="demand")
- [ ] Mouse-look desactivado
- [ ] Verificar responsive en viewport 375px

**Commit:** `feat(profile-3d): add mobile fallback with 3 cards`

---

## Task 6: Integración en `Index.tsx`

- [ ] Modificar `src/pages/Index.tsx`:
  - Importar `ProfileShowcase` en lugar de `Profile`
  - Cambiar título de chrome a `~/passions.md`
  - Mantener `id="profile"` (no romper anclas del nav)
- [ ] Eliminar `src/components/sections/Profile.tsx` (con su test si existe)
- [ ] Verificar que `npm run dev` carga la nueva sección

**Commit:** `feat(profile-3d): integrate ProfileShowcase into Index`

---

## Task 7: Tests

- [ ] `src/lib/profile-content.test.ts` — snapshot de `PASSION_META`, valida `PROFILE_PASSIONS.length === 3`
- [ ] `src/hooks/useDeviceTier.test.ts` — mock de media queries, valida tier
- [ ] `src/components/sections/ProfileShowcase.test.tsx` — con `prefersReducedMotion=true`, renderiza fallback
- [ ] `npm test` pasa
- [ ] `npm run lint` pasa
- [ ] `npm run build` compila

**Commit:** `test(profile-3d): add unit and component tests`

---

## Task 8: Verify + polish

- [ ] Manual QA checklist del spec §10.3
- [ ] Ajuste fino de cámara, luces, cross-fade
- [ ] Verificar 60 FPS en desktop (Chrome DevTools)
- [ ] Verificar 30+ FPS en mobile (DevTools responsive)
- [ ] Limpiar código, comentarios innecesarios (Ponytail mode)
- [ ] Verificar todas las 12 keys i18n en los 4 idiomas

**Commit:** `chore(profile-3d): polish and verify`

---

## Self-Review

**Coverage check:**
- Spec §2 objetivos: tasks 4, 5, 7 ✓
- Spec §3 arquitectura: tasks 1, 3, 4 ✓
- Spec §4 diseño: tasks 3, 4, 5 ✓
- Spec §5 i18n: task 1e ✓
- Spec §6 assets: task 2 ✓
- Spec §7 a11y: tasks 1b, 4b, 5 ✓
- Spec §8 performance: tasks 3d, 4a, 5 ✓
- Spec §9 riesgos: task 0 (migration) + task 4c (Lenis) ✓
- Spec §10 testing: task 7 ✓
- Spec §11 plan: este documento ✓

**Placeholder scan:** sin TBDs, sin "fill in details", código concreto en cada paso crítico.

**Type consistency:** `PROFILE_PASSIONS`, `PASSION_META`, `ProfilePassion` consistentes en tasks 1a, 3b, 4b, 5.

---

## Execution choice

**Plan completo. Recomiendo ejecución inline con checkpoints** dado que:
- El user quiere ejecución inmediata
- Tareas 1 (pequeñas) y 2 (assets) pueden correr en paralelo
- Task 0 (migración) es bloqueante — empezar por ahí
- Resto de tasks secuenciales (dependen de assets y migración)

Procedo con: Task 0 (migración) → smoke test → Task 1 (paralelo) → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8.
