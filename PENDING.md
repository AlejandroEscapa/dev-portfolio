# Pending Tasks — Portfolio Projects Section

## 1. Recortar vídeos de demo

Los vídeos actuales son demasiado largos para un portfolio (~2-3 min cada uno). Se necesitan versiones cortas de ~20-30s con los momentos más impactantes.

### Herramientas recomendadas

- **LosslessCut** (desktop, open source) — corta sin recodificar, instantáneo
- **FFmpeg** (CLI) — para automatizar por consola
- **CapCut** (web/desktop) — si quieres reencuadrar a vertical puro

### Comandos FFmpeg

```bash
# GameVision — extraer segundos 10 a 40 sin recodificar
ffmpeg -i "public\GameVision - Video Técnico.mp4" -ss 10 -to 40 -c copy "public\GameVision-demo.mp4"

# MatchVision — extraer segundos 10 a 30 sin recodificar
ffmpeg -i "public\MatchVision - Video Técnico.mp4" -ss 10 -to 30 -c copy "public\MatchVision-demo.mp4"
```

### Después de crear los clips

Actualizar las rutas en `src/components/sections/Projects.tsx`:

```ts
// Cambiar:
videoSrc: "/GameVision - Video Técnico.mp4",
// Por:
videoSrc: "/GameVision-demo.mp4",

// Cambiar:
videoSrc: "/MatchVision - Video Técnico.mp4",
// Por:
videoSrc: "/MatchVision-demo.mp4",
```

> **Nota:** Los archivos originales se pueden eliminar o mantener como backup. Si se eliminan, liberar ~50-100MB del bundle.

---

## 2. Optimizar peso de vídeos (opcional pero recomendado)

Si los clips recortados pesan más de 5MB cada uno, comprimir:

```bash
# Comprimir con H.264, CRF 23 (buena calidad, peso reducido)
ffmpeg -i "public\GameVision-demo.mp4" -c:v libx264 -crf 23 -c:a aac -b:a 128k "public\GameVision-demo-compressed.mp4"

# Comprimir MatchVision
ffmpeg -i "public\MatchVision-demo.mp4" -c:v libx264 -crf 23 -c:a aac -b:a 128k "public\MatchVision-demo-compressed.mp4"
```

---

## 3. Añadir poster frame (opcional)

Actualmente el vídeo muestra el primer frame hasta que carga. Se puede generar un poster PNG:

```bash
# Extraer frame al segundo 2 como poster
ffmpeg -i "public\GameVision-demo.mp4" -ss 2 -vframes 1 "public\gamevision-poster.jpg"
ffmpeg -i "public\MatchVision-demo.mp4" -ss 2 -vframes 1 "public\matchvision-poster.jpg"
```

Luego añadir la prop `poster` al componente `PhoneVideo`:

```tsx
<PhoneVideo src={project.videoSrc} poster={project.posterSrc} />
```

Y actualizar `PhoneVideo.tsx` para aceptar y usar el prop `poster`.

---

## 4. Posibles mejoras futuras

- [ ] Añadir enlaces externos (GitHub repo, demo en vivo, App Store/Play Store)
- [ ] Soporte para más de 2 proyectos (el array `projects` ya es escalable)
- [ ] Lazy loading de vídeos con `IntersectionObserver` (cargar solo cuando entran en viewport)
- [ ] Botón de pantalla completa para el vídeo
- [ ] Transición suave entre play/pause con fade
