# Auditoría de lanzamiento — dev-portfolio

**Fecha:** 2026-10-05
**Contexto:** El portfolio se va a usar como carta de presentación a empresas. Esta auditoría evalúa qué falta para presentarlo, no el diseño (para eso está `AUDITORIA-2026.md`).
**Método:** skill `web-quality-audit` — inspección de fuente + build/tests/lint en local + verificación externa de los perfiles de GitHub enlazados.
**Estado del repo al auditar:** rama `pulidos-finales`, con trabajo sin commit (ver §2.4).

---

## 1. Resumen ejecutivo

La base técnica está a buen nivel y verificada: build de producción compila limpio, lint sin errores, 55/55 tests verdes (incluidos los de contraste WCAG AA del pipeline de tokens), el 3D viaja en su propio chunk con lazy-load y fallback por dispositivo.

Lo que falta es la capa que un evaluador nota en los primeros 30 segundos, y casi todo son decisiones/contenido, no código:

| # | Hallazgo | Severidad | Dónde |
|---|----------|-----------|-------|
| 1 | "Open GitHub" abre una cuenta sin repos (`alejandrooliesc`) | 🔴 Bloqueante | `portfolio.config.json`, `spotlight-items.ts:35` |
| 2 | El CV del dock es un 404 | 🔴 Bloqueante | `Dock.tsx:126` |
| 3 | Sin despliegue ni dominio propio | 🔴 Bloqueante | (no hay vercel.json / workflow / URL) |
| 4 | Rama sin cerrar + archivo suelto | 🔴 Bloqueante | git status |
| 5 | `og:image` SVG (no renderiza en redes) + faltan meta tags | 🟠 Alta | `index.html:12` |
| 6 | `<html lang="en">` fijo, no sigue al idioma | 🟠 Alta | `LanguageContext.tsx:23-25`, `index.html:2` |
| 7 | Repos TFM sin descripción/topics/screenshots reales | 🟠 Alta | GitHub externo |
| 8 | Casa Húmedo con enlaces flojos | 🟠 Alta | `projects.ts:145-146` |
| 9 | Formulario solo `mailto:` (pérdida de leads) | 🟡 Media | `Contact.tsx:49-51` |
| 10 | Chunk principal 809 kB | 🟡 Media | `dist/` |
| 11 | Sin JSON-LD `Person` | 🟡 Media | `index.html` |
| 12 | Sin baseline Lighthouse en producción | 🟡 Media | pendiente de despliegue |

---

## 2. Hallazgos detallados

### 2.1 🔴 El botón "Open GitHub" abre una cuenta vacía

- **Evidencia:** `portfolio.config.json` declara `"github": "https://github.com/alejandrooliesc"`. `src/lib/spotlight-items.ts:35` abre esa misma URL. Verificado en vivo: la cuenta `alejandrooliesc` **existe pero tiene 0 repos públicos, sin bio ni actividad**.
- **Contraste:** los repos reales (GameVisionTFM, MatchVisionTFM) viven en `github.com/AlejandroEscapa`. El portfolio usa dos identidades distintas según el sitio.
- **Impacto:** un reclutador que pulsa el icono de GitHub ve un perfil muerto. Es el hallazgo de mayor daño de la auditoría.
- **Fix:** decidir qué perfil es el bueno y unificar `portfolio.config.json` + `spotlight-items.ts:35` (+ cualquier otro `github.com/` en el código). Opción más ambiciosa: usar `alejandrooliesc` como perfil público y transferir/pinear ahí los repos buenos, con bio y repos pineados.

### 2.2 🔴 El CV descargable es un 404

- **Evidencia:** `src/components/dock/Dock.tsx:126-136` — el item "resume" crea un `<a href="/cv.pdf" download>` con el TODO explícito `// TODO: drop the actual CV at public/cv.pdf — until then the click 404s`. No existe `public/cv.pdf` (verificado con `ls`).
- **Síntoma visible:** el dock muestra "Downloading…" y falla en silencio.
- **Impacto:** en un portfolio de búsqueda de empleo, el CV es el botón que garantizadamente van a pulsar.
- **Fix:** subir el PDF real a `public/cv.pdf`. Considerar dos ficheros (`cv-es.pdf` / `cv-en.pdf`) enlazados según `lang`, ya que el sitio es bilingüe. Actualmente el nombre de descarga ya es `Alejandro-Olivares-Escapa-CV.pdf`.

### 2.3 🔴 Sin despliegue ni dominio propio

- **Evidencia:** no existe `vercel.json`, `netlify.toml` ni `.github/workflows/`. El único remote es `https://github.com/AlejandroEscapa/dev-portfolio`. No hay indicios de una URL pública.
- **Impacto:** sin URL canónica no se pueden completar los meta tags del §2.5 (`og:url`, `canonical`), y una URL `*.vercel.app` genérica resta percepción frente a un dominio propio.
- **Fix:** desplegar (Vercel/Netlify/Cloudflare Pages — build `npm run build`, salida `dist/`) y comprar un dominio tipo `alejandroolivares.dev`. **Requiere decisión del propietario.**

### 2.4 🔴 Rama sin cerrar

- **Evidencia (git status al auditar):**
  - Modificados sin commit: `src/components/sections/Contact.tsx` (−91 líneas), `Education.tsx`, `i18n/translations.ts`, `pages/Index.tsx`.
  - Sin trackear: `src/components/Footer.tsx` (nuevo, extrae los datos de contacto del Contact) y `flip-check.webm` (32 KB, archivo suelto en la raíz, sin consumidor).
- **Impacto:** publicar con la rama sucia mezcla trabajo a medias con lo revisado.
- **Fix:** decidir qué hacer con `flip-check.webm` (parece sobrar), commit del trabajo del Footer, merge a `main` y desplegar desde `main`.

### 2.5 🟠 Compartir en redes roto a medias (SEO social)

- **Evidencia (`index.html`):**
  - `og:image` apunta a `/logo1.svg` — **LinkedIn, WhatsApp y X no renderizan SVG** como imagen de preventa. Existe `public/logo1.png` (1254×1254 PNG) sin usar para este fin.
  - Faltan: `og:url`, `<link rel="canonical">`, `twitter:card`.
  - Typo en `og:title`: `"Alejandro -Frontend & Mobile Developer…"` (espacio de más tras el guion).
  - `<meta name="author" content="Portfolio">` — debería ser el nombre real.
- **Fix:** generar una imagen 1200×630 (PNG/JPG) con nombre + tagline, apuntar `og:image` a ella, añadir `og:url`/`canonical`/`twitter:card` cuando exista el dominio (§2.3). Sin despliegue, esto no se puede completar.

### 2.6 🟠 `<html lang="en">` fijo

- **Evidencia:** `index.html:2` declara `lang="en"`. `src/context/LanguageContext.tsx:23-25` persiste el idioma en `localStorage["portfolio-lang"]` pero **nunca actualiza `document.documentElement.lang`**.
- **Impacto:** con el sitio en español, los lectores de pantalla pronuncian el texto con fonética inglesa (barrera de accesibilidad) y los buscadores indexan con el idioma equivocado.
- **Fix:** en el `useEffect` ya existente, añadir `document.documentElement.lang = lang`. Tres líneas, sin riesgos.

### 2.7 🟠 Los repos TFM no tienen escaparate

- **Evidencia (verificado en vivo, GameVisionTFM):** el README es muy completo (overview, Getting Started con SDK 35/JDK 17/Firebase/RAWG/NewsAPI, arquitectura, tabla de stack, seguridad, testing, licencia "All Rights Reserved"), PERO:
  - La pestaña "About" de GitHub: *no description, no website, no topics*.
  - Las 4 screenshots del README son **placeholders**, no capturas reales.
  - Sin enlace a demo/vídeo en el README.
- **MatchVisionTFM:** no verificado (la comprobación remota expiró); revisar los mismos puntos.
- **Impacto:** el senior técnico que revisa el portfolio acaba aquí, tras pulsar el enlace del proyecto.
- **Fix:** por repo: descripción, topics, screenshots reales de la app, y si es viable un APK en Releases o un vídeo en el README. Los vídeos de demo ya existen en el portfolio (`gamevision-demo.mp4`, `matchvision-demo.mp4`) — reutilizarlos.

### 2.8 🟠 Casa Húmedo con enlaces flojos

- **Evidencia:** `src/data/projects.ts:145-146` — `githubUrl: "https://github.com/AlejandroEscapa"` (el perfil genérico, no un repo) y `liveUrl: "https://preview--leon-craft-engine.lovable.app"` (URL de preview que además contiene la palabra "preview"). Hay un TODO en `projects.ts:137` que ya lo reconoce.
- **Fix:** repo propio + despliegue decente, o quitar los enlaces de esa tarjeta. **Requiere decisión.**

### 2.9 🟡 Formulario solo `mailto:`

- **Evidencia:** `src/components/sections/Contact.tsx:49-51` lanza `mailto:` (sin backend, decisión documentada en AGENTS.md). El Footer nuevo ya muestra email/tel/LinkedIn en claro, lo que mitiga.
- **Riesgo:** si el reclutador no tiene cliente de correo configurado, el lead se pierde sin rastro.
- **Fix (opcional):** servicio gratuito tipo Web3Forms/Formspree detrás del mismo formulario. **Requiere decisión.**

### 2.10 🟡 Peso del bundle

- **Evidencia (build de producción):**
  - `dist/assets/index-DF3v2iLD.js` — 809.31 kB (262.53 kB gzip): GSAP + Framer + Radix + Lenis juntos.
  - `dist/assets/HeroScene-DqTPc11j.js` — 1,095.83 kB (300.26 kB gzip): el árbol three/drei/postprocessing, **lazy-loaded** — asumible.
- **Fix (opcional):** `manualChunks` en `vite.config.ts` para separar gsap/framer. No urgente; un Lighthouse lo señalará.

### 2.11 🟡 Sin JSON-LD `Person`

- **Evidencia:** `index.html` no tiene structured data.
- **Fix:** bloque JSON-LD (~15 líneas) con nombre, puesto y `sameAs` (LinkedIn + GitHub). Los parsers de RRHH/IA lo leen.

### 2.12 🟡 Sin baseline Lighthouse en producción

- **Pendiente por diseño:** no hay URL desplegada (§2.3), así que no se puede medir. Una vez desplegado, pasada móvil + desktop mirando LCP (fondo pexels preloaded en `index.html:27-34`), INP (3D en pantalla) y consola limpia. Es el gate de cierre.

---

## 3. Lo que ya está a buen nivel (verificado)

- `npm run build` ✅ compila en 14.4 s.
- `npm test` ✅ 13 ficheros / 55 tests pasando (16.3 s).
- `npm run lint` ✅ 0 errores, 10 warnings — **todos** `react-refresh/only-export-components` (patrón Fast-refresh en primitivas shadcn y `LanguageContext.tsx:46`); conocidos e inofensivos.
- Pipeline de tokens con tests de contraste WCAG AA (`token-contrast.test.ts`).
- 3D aislado en chunk propio con lazy-load, fallback por `useDeviceTier` y `prefers-reduced-motion` respetado.
- Preload correcto de la imagen LCP con `imagesrcset` (`index.html:27-34`).
- `robots.txt` abierto para crawlers principales.
- Favicon SVG propio.

> Nota: `AUDITORIA-2026.md` (2026-07-08) está **obsoleta** en al menos un punto clave: ya existe code-splitting (HeroScene lazy + chunk separado). No usar como referencia de estado actual.

---

## 4. Orden de ejecución recomendado

1. **Unificar perfil GitHub** (§2.1) — 5 min, impacto máximo, sin dependencias.
2. **Subir el CV** (§2.2) — sin dependencias.
3. **Cerrar la rama**: commit del Footer, resolver `flip-check.webm`, merge a `main` (§2.4).
4. **Desplegar + dominio** (§2.3) — decisión de hosting y dominio pendiente del propietario.
5. **Meta tags completos** con la URL real + `lang` dinámico + PNG 1200×630 para OG (§2.5, §2.6).
6. **Escaparate de los repos TFM** en GitHub (§2.7).
7. **Lighthouse sobre producción** (§2.12) y rematar lo que señale (§2.10).
8. Opcionales a valorar: formulario real (§2.9), JSON-LD (§2.11), enlaces Casa Húmedo (§2.8).

## 5. Estado de verificación

- **Verificado por fuente:** `index.html`, `portfolio.config.json`, `projects.ts`, `Dock.tsx`, `LanguageContext.tsx`, `spotlight-items.ts`, ausencia de ficheros de despliegue, build/test/lint ejecutados en local.
- **Verificado en vivo (externo):** perfil `alejandrooliesc` (vacío), repo `GameVisionTFM` (README completo, About vacío, screenshots placeholder).
- **Pendiente de verificar:** `MatchVisionTFM` (la comprobación remota expiró), Lighthouse en producción (bloqueado por §2.3).

---

## 6. Ronda de fixes 2026-10-06

Aplicados los rápidos que no dependían de decisiones externas. Verificación: 55/55 tests + build de producción OK tras los cambios.

| Hallazgo | Estado |
|----------|--------|
| §2.1 Perfil GitHub vacío | ✅ **Fix aplicado** — dock (`Dock.tsx:96`), Spotlight (`spotlight-items.ts:35`) y `portfolio.config.json` ahora apuntan a `github.com/AlejandroEscapa`. Verificado: 0 referencias a `alejandrooliesc` en el código. |
| §2.2 CV 404 | ⏳ Pendiente del propietario — exportar el PDF a `public/cv.pdf`. |
| §2.3 Despliegue/dominio | ⚠️ **Nuevo dato crítico:** la URL facilitada como "web" (`preview--leon-craft-engine.lovable.app`) **no es pública** — redirige (302) al auth-bridge de Lovable para cualquier visitante sin sesión. No sirve ni como canonical ni para reclutadores. Pendiente: despliegue real (Vercel/Netlify/CF Pages) o publicar el preview de Lovable. |
| §2.4 Rama sin cerrar | 🔄 Commits aplicados (footer + fixes + docs); merge a `main` pendiente de confirmación. `flip-check.webm` sigue en la raíz (pendiente de decidir borrado). |
| §2.5 OG/social | ✅ **Fix aplicado** — typo de `og:title`, `author` real, `og:image` → nueva `public/og.png` (1200×630, generada con sharp: fondo degradado + nombre + tagline + logo, verificada visualmente), `og:image:width/height`, `twitter:card`/`twitter:title`/`twitter:description`/`twitter:image` y JSON-LD `Person`. `og:url`/`canonical` siguen pendientes del dominio (§2.3). |
| §2.6 `lang` estático | ✅ **Fix aplicado** — `LanguageContext.tsx` ahora hace `document.documentElement.lang = lang` en su `useEffect`. |
| §2.7 Repos TFM | ⏳ Pendiente — `gh` CLI no disponible en la máquina; descripción/topics/screenshots hay que ponerlos a mano en github.com/AlejandroEscapa. |
| §2.8 Casa Húmedo | ⚠️ Su `liveUrl` es la misma URL auth-murada de §2.3 — hasta que haya un despliegue público, el enlace no sirve a un visitante externo. |
| §2.9-2.12 | Sin cambios (decisiones/optimizaciones medias). |

Regeneración de la tarjeta OG (si cambia el logo o el tagline): script one-off con `sharp` (SVG de fondo + composite de `public/logo1.png` a 170×170 → `public/og.png`).
