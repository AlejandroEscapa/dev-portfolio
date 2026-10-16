# Fase 2b — Placeholders honestos (spec de diseño)

> Aprobado por My G por secciones el 2026-10-13. La 2b sustituye los badges
> del slot de la 2a por imágenes demo estructurales, sin tocar layout.

## Decisión

La 2b SÍ se ejecuta con placeholders, siempre que sean demos estructurales
marcadas como tales — nunca huecos grises de obra ni imágenes remotas.

## Alcance (solo inner de slots)

- Los tres slots `data-slot="foto-futura"` (`aspect-video`, caja estable de la
  2a) pasan de badges a `<img object-cover>` 1:1. Cero cambios de grid, spans,
  anchors (`#certifications` etc.), Spotlight o CLI.
- Sin claves i18n nuevas: labels demo hardcoded en mono + `TODO(2b-foto-real)`
  en código por slot.

## Mapping (un crop distinto por slot)

- `setup` → recorte pexels A, `kiosco` → recorte B, `PDA` → recorte C, todos
  locales ya existentes en `public/` (los que sirven de fondo: 640/1280/1920).
- Cero ficheros nuevos en `public/`; `public-assets.test.ts` sigue verde sin
  tocarlo. Mapping documentado aquí; el swap a foto real reutiliza la misma
  caja y es 1:1.

## Overlay (marca de demo)

- Velo con tokens + label mono `demo / setup` (idem kiosco, PDA). Sin pastillas
  extra, sin comentario-solo-en-código: la demo nunca debe parecer contenido
  final del CV.

## Norma verificable

- Los placeholders no afirman nada real: son composición, no contenido. Ningún
  pie, caption ni OG los presenta como fotos propias.

## Verificación de cierre

- `npm test` 126+/126+ EXIT 0, `npm run lint` 0 errores, `npm run build` EXIT 0
  (todo con `pipefail`), en `feat/fase-2b-placeholders` desde `main` — o desde
  `feat/fase-2a-estructura` si la 2a aún no mergeó (decidir al abrir la rama).
