---
doc_id: PROJECT_LOG
version: 1.3
updated: 2026-03-11
---

# PROJECT LOG - Dashboard de Cartera Lexia

**Proyecto:** Dashboard de Cartera Lexia Abogados
**Cliente:** Torres Fernandez de Castro Abogados SAS (Lexia)
**URL:** https://lexia.metrik.com.co
**Repo:** https://github.com/metrik360/lexia-facturacion

---

## SPRINT 1 — CERRADO

**Periodo:** 18/12/2024 - 06/02/2026
**Objetivo:** Dashboard de cartera con datos en tiempo real

### Commits

| Fecha | Commit | Descripcion |
|-------|--------|-------------|
| 18/12/2024 | `c367014` | Dashboard de Facturacion Lexia Abogados (commit inicial) |
| 22/12/2024 | `29f8617` | Configuracion para deploy en Vercel |
| 22/12/2024 | `216e3ee` | Configuracion para subpath /lexia |
| 26/12/2024 | `50ffdc2` | Fix: corregir rutas de logo y API para Vercel |
| 26/12/2024 | `43e03fd` | Fix: cambiar a rewrites/redirects en vercel.json |
| 26/12/2024 | `09b2aec` | Fix: usar wildcard en rewrite de API para pasar query params |
| 26/12/2024 | `f08e483` | Refactor: eliminar subpath /lexia para deploy directo |
| 29/12/2024 | `51c3508` | Sync con version en produccion (Vercel) |

### Entregables

| Entregable | Estado | Notas |
|------------|--------|-------|
| Dashboard HTML + CSS + JS | Completado | index.html (394KB) |
| API Proxy Siigo | Completado | api/siigo.js |
| Sistema de autenticacion | Completado | api/auth.js (5 usuarios, JWT) |
| Integracion movimientos bancarios | Completado | api/movimientos.js (Google Sheets CSV) |
| Deploy Vercel | Completado | lexia.metrik.com.co |
| REQUIREMENTS_DOC.md | Completado | Discovery documentado |
| DATA_SPEC.md | Completado | Fuentes de datos documentadas |
| DESIGN_SYSTEM.md | Completado | Paleta y componentes Lexia |

### Decisiones tecnicas

1. **Stack:** HTML vanilla + Vercel Serverless Functions (sin framework)
   - Razon: dashboard single-page, sin necesidad de SPA framework
2. **Auth:** JWT propio con SHA-256 en serverless function
   - Razon: no se justifica Supabase Auth para 5 usuarios fijos
3. **Movimientos bancarios:** Google Sheets como CSV publico
   - Razon: el cliente ya usa Google Sheets para tracking
4. **Subdominio:** lexia.metrik.com.co en Vercel
   - Razon: branding MeTRIK, deploy automatico

### Problemas resueltos

| Problema | Solucion | Fecha |
|----------|----------|-------|
| Subpath /lexia rompia rutas | Eliminado subpath, deploy directo en raiz | 26/12/2024 |
| Query params no pasaban a API | Wildcard en rewrite de vercel.json | 26/12/2024 |
| Rutas de logo y API incorrectas en Vercel | Correccion de paths absolutos | 26/12/2024 |

---

## SPRINT 2 — MEJORAS PDF (EN PROGRESO)

**Periodo:** 03/03/2026 - presente
**Objetivo:** Mejorar reporte PDF con indicadores comparativos y visualizacion

### Commits

| Fecha | Commit | Descripcion |
|-------|--------|-------------|
| 03/03/2026 | `8abaf4e` | Normalizar documentacion Sprint 1 + trackear archivos faltantes |
| 03/03/2026 | `2c13f88` | Filtro YTD en tablas PDF de ventas por CC y cliente recurrente |
| 03/03/2026 | `3cf52d8` | Ocultar Cartera Real y tabla CxC del PDF por solicitud del cliente |
| 04/03/2026 | `2077491` | Deduplicar movimientos bancarios por columna Documento |
| 06/03/2026 | `dbee676` | Page break en tabla Clientes Recurrentes del PDF |
| 09/03/2026 | `c34a048` | Variacion % en tablas PDF + degradado y etiquetas en graficas |
| 09/03/2026 | `941adf5` | Fix: permitir que tablas PDF derramen entre paginas en vez de cortarse |

### Decisiones tecnicas

1. **Variacion %:** Compara ultimo año vs anterior. Formula: `((act - ant) / ant) * 100`
   - Icono tendencia: triangulo verde (sube), rojo (baja), punto gris (neutro)
   - Reemplaza columna "Total" que no aportaba insight comparativo
2. **Degradado barras:** Paleta teal monotona (claro=antiguo, oscuro=reciente)
   - Razon: mejor lectura visual que colores arbitrarios
3. **Etiquetas en barras:** Valor rotado 90° dentro de la barra, solo si altura >= 12px
   - Razon: evitar clutter en barras pequenas

### Problemas resueltos

| Problema | Solucion | Fecha |
|----------|----------|-------|
| Tablas PDF se cortaban si excedian una pagina | Eliminar page-break-inside:avoid de secciones de tabla, cambiar html2pdf de avoid-all a css+legacy, proteger filas individuales | 09/03/2026 |

### Notas

- Cartera Real y tabla CxC siguen ocultas en el PDF (codigo comentado, reactivable)
- Movimientos bancarios se deduplican por campo "documento" para evitar inflar totales

---

## SPRINT 3 — INFRAESTRUCTURA (CERRADO)

**Periodo:** 11/03/2026
**Objetivo:** Migrar dominio a Vercel team metrik-one y fix de PDF para anos anteriores

### Cambios

| Fecha | Descripcion |
|-------|-------------|
| 11/03/2026 | Fix: mesAnalisisPDF usa 12 para anos pasados (ano completo en vez de mes actual) |
| 11/03/2026 | Fix: cambiarAnioAnalisis() pone cierreMes='12' para anos anteriores al actual |
| 11/03/2026 | Cache headers en vercel.json (no-cache para index.html) |
| 11/03/2026 | Migrado dominio lexia.metrik.com.co de cuenta personal a team metrik-one |
| 11/03/2026 | Limpieza: eliminado proyecto viejo dashboard-pi-snowy-93 de cuenta personal |

### Decisiones

1. **Dominios centralizados en metrik-one:** Todos los dominios de proyectos en el team, cuenta personal limpia
2. **metrik.com.co sigue en GitHub Pages:** No afectado por migracion Vercel
3. **Cache-busting:** Headers no-cache en vercel.json para HTML, evita versiones viejas en browser

### Problemas resueltos

| Problema | Solucion | Fecha |
|----------|----------|-------|
| lexia.metrik.com.co servia proyecto viejo | Dominio apuntaba a dashboard-pi-snowy-93 en cuenta personal. Eliminado de cuenta vieja, agregado a lexia-facturacion en metrik-one | 11/03/2026 |
| PDF mostraba anos futuros al seleccionar ano anterior | mesAnalisisPDF usaba mes actual en vez de 12 para anos pasados. Fix: detectar si anioBase < anioActual y usar 12 | 11/03/2026 |

---

*Ultima actualizacion: 11/03/2026*
