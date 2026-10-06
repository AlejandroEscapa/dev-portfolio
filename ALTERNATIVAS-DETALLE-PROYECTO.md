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
