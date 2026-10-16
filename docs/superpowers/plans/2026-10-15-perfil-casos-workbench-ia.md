# Perfil, casos demostrables y Workbench de IA

Fecha: 2026-10-15  
Estado: completado (2026-10-15)

## Objetivo

Presentar un perfil profesional claro y comprobable sin rehacer la navegación: Full Stack con foco móvil, proyectos propios como evidencia de Android/iOS/React, Angular asociado a las prácticas de MAS, y un bloque breve sobre el proceso asistido por IA con revisión humana.

## Decisiones de contenido

- React se asocia a los proyectos propios; Angular, a la experiencia de prácticas en MAS.
- MAS se etiqueta como prácticas/desarrollo frontend, no como liderazgo. Se describe construcción del frontend de kiosco y colaboración con backend/producto, sin afirmar dirección del equipo.
- Casa Húmedo se mantiene como demo/concepto; no se afirma lanzamiento en producción.
- Creators describe el trabajo en el ecosistema existente (WMS/SQL Server, Laravel, Slim 3, Android en PDA, Magento y Odoo) sin afirmar métricas o resultados no aportados.
- Tokio School usa las fechas confirmadas: enero de 2024 a marzo de 2026. El texto no afirma publicación de la app en tiendas.
- Elev8 no se ha reescrito ni usado para justificar claims; los datos de credencial siguen pendientes de verificación.
- Workbench menciona Cursor, MCP, GSD y skills propias como método declarado, no como evidencia de resultados. Se explica la responsabilidad humana de revisar diff y tests.

## Cambios aplicados

- Copy de posicionamiento y descripciones de MAS, Creators y proyectos en ES/EN.
- Nuevo bloque `AIWorkbench` después de Proyectos, con navegación desde Nav, Spotlight y terminal (`workbench`).
- Actualización de tagline, title, description, Open Graph, Twitter y JSON-LD para reflejar el posicionamiento.
- Tests de copy factual, simetría de traducciones, comando/Spotlight y render bilingüe del bloque.

## Criterios de aceptación

- [x] Copy bilingüe, consistente y sin atribuir a Angular experiencia de liderazgo/producción.
- [x] MAS identificado inequívocamente como prácticas.
- [x] React asociado a proyectos personales y Casa Húmedo sigue marcado como demo.
- [x] Tokio School usa el rango confirmado.
- [x] Workbench compacto, bilingüe y navegable por Nav, Spotlight y CLI.
- [x] Metadata pública refleja el nuevo titular.
- [x] `npm test`: 30 archivos / 136 tests pasan.
- [x] `npm run lint`: 0 errores, 10 warnings de Fast Refresh ya existentes.
- [x] `npm run build`: tokens, typecheck y build Vite completados.
- [x] Verificación en Preview (build de producción): Workbench visible en desktop y móvil; dos columnas en desktop, columna única en 390px, sin overflow horizontal; idioma `lang=es` y click de Nav comprobados (scroll landing dentro del bloque).

## Limitaciones conocidas

No se han aportado artefactos públicos aprobados para mostrar como evidencia de Cursor/MCP/GSD/skills; por ello Workbench describe el proceso y no incluye capturas ni código privado. Las imágenes/slots demo actuales se conservan conforme a la spec aprobada de placeholders; no se sustituyen por material inventado. Build mantiene la advertencia existente de chunk >500 kB; no se aborda porque queda fuera del alcance.
