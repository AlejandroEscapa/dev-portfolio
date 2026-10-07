# Alternativas de diseño — vista de detalle de proyecto

**Fecha:** 2026-10-06
**Contexto:** La vista de detalle duplicaba datos: los badges (Plataforma, Framework, Nota final, Backend) repetían categorías de la tira inferior de stack (Language, Framework, Arquitectura, Backend, Contexto). Este documento conserva las 5 alternativas evaluadas para poder volver atrás.

**Lectura de diseño:** detalle de portfolio de desarrollador para reclutadores, modo *preserve* — se mantiene el lenguaje desktop-OS (chrome de ventana, etiquetas mono, hairlines, tokens). Deduplicación de datos, no nueva estética.

---

## A. Ficha única — fusionar badges + tira en un solo grid de especificaciones

Mata las dos superficies y crea una sola: bajo el About, un grid 2×3 con cada dato exactamente una vez (Plataforma, Lenguaje, Framework, Arquitectura, Backend, Contexto), con el estilo de etiqueta mono de los badges. La tira inferior desaparece; su altura se reparte entre vídeo y ficha.

- **A favor:** cero repetición, un solo sitio donde mirar, gana una fila entera de altura.
- **Contra:** la columna derecha se carga más; se pierde el ritmo de la tira a todo ancho.
- **Esfuerzo:** bajo. Solo `ProjectDetail.tsx` + CSS.

## B. Barra de estado de editor — la tira se convierte en status bar

La tira inferior pasa a ser una línea mono tipo status bar de VS Code (`swift, swiftui, mvvm, firebase, api-football — tfm`), sin categorías ni cajas. Los badges curados (Plataforma, Nota final) se quedan en la ficha; el stack pierde sus etiquetas de categoría.

- **A favor:** muy de la casa (coherente con el chrome de pestaña-editor de las cards), elegante, libera la mitad de la altura de la tira.
- **Contra:** la línea mono debe medirse para no partirse en dos.
- **Esfuerzo:** bajo.

## C. Specs a cabecera — los datos curados suben junto al título

Bajo el título del detalle, una línea meta mono (`iOS · SwiftUI · 9/10`) con los datos curados, aprovechando el aire del header. La tira inferior se queda solo con el stack real (sin las categorías que ya salen arriba) y la ficha se queda en About + botones.

- **A favor:** aprovecha el título, mantiene las dos superficies sin solape.
- **Contra:** sigue habiendo dos sitios con datos; el header corre riesgo de saturarse con el botón "Volver".
- **Esfuerzo:** medio.

## D. Sin tira — todo en la ficha, etiquetas sueltas

Elimina la tira por completo. La ficha: About → chips mono sueltos (una línea de tags sin categorías) → botones. Los badges se reducen a lo no-tecnológico (Plataforma, Nota final). El alto fijo del stage se reduce y vídeo + ficha ganan.

- **A favor:** la más simple y la que más espacio libera; simplifica el modelo de datos.
- **Contra:** pierde la pedagogía de categorías dentro del detalle.
- **Esfuerzo:** bajo.

## E. Inspector de archivos — panel "Get Info" del OS *(ELEGIDA)*

La ficha derecha se convierte en un inspector de propiedades estilo file-info del sistema operativo: filas etiqueta mono + valor, agrupadas en dos bloques con una única hairline por grupo (sin borde por fila):

- **Identidad:** Plataforma, Nota final, Contexto.
- **Stack:** Lenguaje, Framework, Arquitectura, Backend, Estilos, Integración (las que existan por proyecto).

Sustituye a badges y tira; la tira inferior desaparece y su altura se reparte. Los valores van en mono (metadatos de archivo del OS). Los highlights de datos que ya cubren las categorías (framework, architecture, backend, integration, context) dejan de renderizarse — las categorías son más completas (Backend: "Firebase, API-Football" frente al "Firebase" del badge).

- **A favor:** personalidad OS máxima, fuente de verdad única (los `techTags` categorizados), muy profesional.
- **Contra:** es la que más CSS nuevo requiere (aún así solo en el módulo de la sección).
- **Esfuerzo:** medio. `ProjectDetail.tsx` + `projects.module.css` + 2 claves i18n nuevas (títulos de grupo).

---

## Deduplicación aplicada en la E (regla)

Un highlight deja de mostrarse si su sufijo de clave (`projects.highlight_X`) coincide con una categoría presente en el stack agrupado (`projects.category_X`). Sobreviven siempre `platform` y `grade`, que ninguna categoría cubre. La categoría `context` se pinta en el grupo Identidad por semántica; el resto van a Stack.

## Estado

- **2026-10-06:** Elegida la **E** y implementada en la rama `new-project-design` (commit `1e248ca`).
- **2026-10-06 (mismo día):** La **E se rechaza tras verla en vivo** ("demasiado texto y cutre") y se revierte (`90ddc98`). Elección final del agente: **A ejecutada con criterio** — conserva el lenguaje de tiles con icono (el elemento visual más rico ya verificado) pero reducido a los 1-3 datos que nada más cuenta (Plataforma, Nota final, Contexto); el stack completo desaparece del detalle porque ya lo cuentan los chips de la card y la narrativa del About. La tira inferior se elimina con sus estilos. La deduplicación es la misma regla: un highlight cae si su categoría ya existe en el stack agrupado.
- **2026-10-06 (ronda aditiva):** La tira inferior **vuelve por petición del usuario** pero como línea de datos aditivos: nuevos campos opcionales `apis`/`features` en los datos (commits `9ebd8b8`, `34efe40`), Interfaz y Arquitectura salen de las categorías existentes. Contrato: una línea como mucho (nowrap + ellipsis), altura de card intacta.
- **2026-10-06 (pulido):** Tiles acotados al contenido (`flex` + `fit-content`, terminan donde terminan los datos) y botones de acción con tratamiento moderno de marca desde el módulo (commit `2ab68ce`).

---

# Ronda 2 — Dilema título/altura del detalle (2026-10-06)

**Contexto:** La caja de media es fija, pero las manchas visuales no coinciden: los vídeos (portrait horneado en 16:9) llenan el marco; la captura de Casa Húmedo (paisaje) deja aire muerto arriba y abajo con `contain`. A eso se suma el título gigante centrado del header: ocupa una fila entera para un dato, sin partner compositivo — lectura de "cutre". La pregunta: dónde vive el título y cómo se iguala el ritmo vertical entre medios heterogéneos.

## F. Título en la ficha, asimétrico *(elegida, combinada con J)*

El título se muda a la columna de texto, encima del About: `vídeo izq. / [TÍTULO + About + tiles + botones] dcha`. El header queda como fila fina solo con "Volver". Descripciones resumidas de los tres proyectos (copy en `translations.ts`, en y es). Casa Húmedo no engorda en alto porque J (abajo) arregla su caja.

- **A favor:** asimetría con propósito; el título vive junto a lo que nombra; libera una fila entera de altura.
- **Contra:** cambia el gesto "ventana con título centrado"; header casi vacío.
- **Esfuerzo:** medio. `ProjectDetail.tsx` + CSS + copy.

## G. Título como chrome del sistema

El título del detalle pasa a ser la pestaña activa de la ventana o el propio título de la ventana (`~/projects`), como el `matchvision.swift` de las cards; se elimina el H2 gigante.

- **A favor:** máxima coherencia OS; cero poesía; la ficha gana espacio.
- **Contra:** pierde el momento tipográfico grande; la marca del proyecto pesa menos que la narrativa.

## H. Título sobre el media

Título anclado abajo-izquierda del marco de vídeo con scrim, estilo poster editorial.

- **A favor:** impacto máximo, composición con el vídeo a sangre.
- **Contra:** tapa producto; contraste frágil; raro sobre la captura web.

## J. Igualar la altura útil por tipo de media (arreglar la raíz)

La caja de media trata distinto a la imagen: la captura de Casa Húmedo se centra sobre una **copia desenfocada y teñida de sí misma** (ambient fill), de modo que el paisaje no genere aire muerto y las tres fichas compartan ritmo vertical sin alterar su relación de aspecto.

- **A favor:** ataca la queja real ("se siente distinto" entre proyectos) sin tocar el modelo de datos; compatible con F/G/H/I.
- **Contra:** nuevo recurso visual (fondo blur) que debe usarse con moderación.

## I. Rediseño hero del detalle

Media a sangre como fondo del bloque entero, ficha flotando en panel de cristal con el título dentro.

- **A favor:** la opción más espectacular.
- **Contra:** descarta el trabajo de la ronda, mayor riesgo, choca con el idioma de ventanas contenedoras de la web.

## Decisión

- **2026-10-06:** Implementada **F + J** en la rama `detalle-asimetrico` (propuesta A+D comunicada al usuario, numeradas aquí como F y J).
