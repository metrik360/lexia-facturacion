---
doc_id: PROJECT_LOG
version: 1.0
updated: 2026-03-03
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

## SPRINT 2 — NO INICIADO

Sin requirements definidos.

---

*Ultima actualizacion: 03/03/2026*
