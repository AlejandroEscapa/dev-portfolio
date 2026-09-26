# Propuestas 3D del hero — decisión y contexto

> Documento de referencia para el rediseño del hero 3D. La rama `3d-design`
> implementa la **Propuesta A**; este doc conserva las tres direcciones
> desarrolladas para poder cambiar de diseño en el futuro sin re-investigar.
> Creada el 2026-09-26 durante la ronda de rediseño del hero.

## Contexto técnico del asset

Fuente: `public/3d/zoro_fanko_pophigh-poly.glb` (16.1 MB, descarga de
Sketchfab, estilo Funko Pop del personaje Zoro).

| Propiedad        | Valor                                                        |
| ---------------- | ------------------------------------------------------------ |
| Generador        | `Sketchfab-0.3.0` (glTF 2.0 core, sin extensiones)           |
| Geometría        | 4 primitivas · 257,071 vértices · 479,996 triángulos         |
| Texturas         | 1 × JPEG (2.06 MB), UVs presentes, sin tangentes             |
| Materiales       | 1 (`material_0`, metallic-roughness plano)                   |
| Animaciones      | 0 (malla estática)                                           |
| Jerarquía        | `Sketchfab_model → root → GLTF_SceneRootNode → _0 → 4 meshes`|
| Tamaño (unidades)| ≈ 1.13 × 1.72 × 1.04 (X/Y/Z), centrado cerca del origen      |
| Atributos        | POSITION, NORMAL, TEXCOORD_0 — sin COLOR_0, sin TANGENT      |

**Pipeline de optimización aplicado** (rama `3d-design`):
`@gltf-transform/cli` → `dedupe` + `prune` + compresión **Draco** →
`public/3d/zoro-fanko-pop-draco.glb` (objetivo ≤ 5 MB; el 90 % del peso
original es geometría sin comprimir). El original NO se sirve en la web;
queda como fuente intocada en el repo.

**Carga en runtime**: `useGLTF` de drei (decodificador Draco integrado)
+ `React.lazy` para que el Canvas no entre en el bundle inicial.

**Decisiones transversales a las 3 propuestas:**

- Colores 3D reactivos a los 4 temas: patrón ya probado en `Hero3D.tsx`
  (MutationObserver sobre `data-theme` leyendo las triples HSL crudas de
  `--primary` / `--accent` y envolviéndolas en `hsl(...)` para `THREE.Color`).
- `prefers-reduced-motion`: sin turntable, sin flotación, sin escaneo —
  pose estática elegante.
- `useDeviceTier` **reactivado** (resuelve la deuda §15.11 de AGENTS.md):
  tier `low` → sin postprocesado, sin `Float`, sin animación de entrada,
  `frameloop="demand"` (un render tras cargar). Tier `mid`/`high` →
  experiencia completa. DPR limitado a `[1, 1.75]`.
- Render pausado con pestaña oculta o hero fuera de viewport.
- La ventana del hero se llama `~/object.glb` (WindowChrome existente) —
  el concepto narrativo "visor de objeto" ya estaba sembrado.
- GSAP siempre con `gsap.context()` enraizado en un ref real (§15.8).
- `@react-three/postprocessing` estaba instalado y sin usar; las
  propuestas A y C lo activan.

---

## Propuesta A — Cápsula holográfica *(IMPLEMENTADA en `3d-design`)*

**Idea**: la ventana `~/object.glb` es una vitrina de colección premium.
La figura se **materializa** con un barrido de escaneo vertical, flota
sobre un pedestal con glow de acento y gira en turntable lento con
parallax de ratón. Look "coleccionista + holograma", textura original
respetada.

**Coreografía:**

1. Carga (lazy) → fallback: el glow CSS actual pulsa suavemente.
2. Materialización (~1.6 s): fade-in de la figura + anillo emisivo que
   barre de abajo a arriba una vez (GSAP timeline sobre refs de three).
3. Reposo: turntable lento + parallax de ratón (lerp 0.05) + `Float` sutil.
4. Interacción premium: drag para rotar (OrbitControls: zoom y pan
   deshabilitados, límites polares), hover intensifica el rim light.
5. Postprocesado: Bloom selectivo (umbral alto — solo pedestal/anillo
   emisivo brillan) + Vignette sutil.

**Escena**: pedestal = cilindro con arista emisiva + plano de glow radial
bajo la figura. Iluminación con Lightformers de drei dentro de
`<Environment>` (key/fill/rim; rim en color primario) — sin HDR externo,
sin CDN, sin descarga en runtime.

**Coste de mantenimiento**: medio. Una sola escena coreografiada; el
estado de interacción es simple (hover + drag).

---

## Propuesta B — Inspector de asset CAD

**Idea**: la ventana es un **inspector de assets 3D** al estilo CAD. La
figura se muestra en modo X-ray (wireframe con `<Edges>` marcados) con
callouts `<Html>` de drei anclados a la malla mostrando datos reales del
archivo (tris, vértices, material, tamaño en unidades). Click alterna
sólido ↔ wireframe. Look "ingeniero de assets", monocromo técnico.

**Elementos:**

- Capa wireframe: `Edges` de drei sobre la malla + material base
  semitransparente (o `wireframe: true` puro en la variante extrema).
- Callouts: `<Html>` con líneas leader dibujadas (CSS o `<Line>`), datos
  leídos del propio GLB parseado en build-time o hardcodeados de este doc.
- Modo sólido: material físico neutro (blanco mate / metal cepillado)
  para que la forma mande, no la textura.
- Sin pedestal — la figura flota en vacío técnico con grid de blueprint
  (opcional `<Grid>` de drei con fade por distancia).
- Postprocesado: sin bloom (rompería el look técnico); opcional
  aberración cromática mínima en el toggle.

**Coste de mantenimiento**: bajo-medio. Menos coreografía, más UI (los
callouts son HTML/CSS reutilizable). Riesgo: el X-ray con 480k tris
necesita la versión decimada para que las aristas sean legibles — en la
práctica se usaría una segunda versión del GLB decimada a ~40-60k tris
(`gltf-transform simplify`).

**Para reactivarla**: partir de la escena de la Propuesta A, quitar
pedestal/coreografía, añadir `Edges` + callouts + toggle de material.

---

## Propuesta C — Híbrido (cápsula + inspector)

**Idea**: capas de detalle progresivas. Arranca exactamente como la
Propuesta A (materialización + pedestal + turntable) y al **hover** sobre
la figura desvanece la textura hacia el X-ray con aristas y aparecen los
callouts de la Propuesta B. El click sigue alternando X-ray fijo.

**Coreografía:**

1-5. Idénticas a la Propuesta A.
6. Hover → lerp de opacidad: material sólido → wireframe/edges, callouts
   fade-in con `<Html>`, rim light se apaga a favor de las aristas.
7. Click → fija/desfija el modo X-ray.

**Coste de mantenimiento**: alto. Doble sistema de materiales con
transición y estado de modo (hover efímero vs. click persistente). Es la
más espectacular y la que más superficie de bugs tiene.

**Para reactivarla**: la A es su subconjunto; se añade la capa B encima.

---

## Cómo cambiar de propuesta en el futuro

1. Toda la escena vive en `src/components/three/` (`HeroScene.tsx` +
   componentes hijos); `HeroShowcase.tsx` solo la monta con `React.lazy`.
2. El GLB optimizado y su fuente están en `public/3d/`.
3. El patrón de tema-reactividad y las reglas de rendimiento de este doc
   son comunes — solo cambia la composición de la escena.
4. Para B: generar además el GLB decimado (`npx @gltf-transform/cli
   simplify --error 0.0005` ≈ 40-60k tris) para aristas legibles.
