# Lexia — Dashboard de Facturacion

## Proyecto
- **Tipo:** Dashboard operacional (Clarity)
- **Cliente:** Torres Fernandez de Castro Abogados SAS (Lexia Abogados)
- **Stack:** HTML/CSS/JS vanilla + Vercel Serverless Functions (Node.js)
- **Repo:** https://github.com/bi-metrik/lexia-facturacion
- **Deploy:** https://lexia-facturacion.vercel.app
- **Dominio:** https://lexia.metrik.com.co
- **Vercel Team:** metrik-one

## Estructura del proyecto

```
lexia-facturacion/
├── index.html          # App completa (single-file, ~8300 lineas)
├── server.js           # Servidor local de desarrollo (puerto 3001)
├── vercel.json         # Config Vercel: rutas /lexia/* + cache headers
├── api/
│   ├── auth.js         # Login con JWT + SHA-256 (5 usuarios hardcoded)
│   ├── siigo.js        # Proxy a Siigo API (facturas, clientes, NC)
│   └── movimientos.js  # Lee movimientos bancarios desde Google Sheets CSV
├── assets/
│   └── logo-lexia.png
├── data/               # Datos locales de referencia (no usados en prod)
└── docs/               # Documentacion del proyecto
    ├── PROJECT_STATE.md
    ├── PROJECT_LOG.md
    ├── REQUIREMENTS_DOC.md
    ├── DATA_SPEC.md
    ├── DESIGN_SYSTEM.md
    ├── USER_GUIDE.md
    └── CLIENT_APPROVALS.md
```

## Arquitectura

### Frontend (index.html)
App single-page vanilla. Todo en un archivo: HTML, CSS, JS. Sin framework.

**Pestanas:**
- **Resumen** (`graficos`) — KPIs, graficas de barras comparativas, cartera por horizonte
- **Facturacion** (`tablas`) — Tablas de ventas por cliente y centro de costos, detalle de facturas
- **Analisis por Ano** (`conciliacion`) — Conciliacion mensual, graficas YTD, exportar PDF
- **Cuentas por Cobrar** (`cuentasPorCobrar`) — Aging de cartera, detalle por cliente
- **Diagnostico** (`diagnostico`) — Validacion de datos (oculto por defecto)

**Variables globales clave:**
- `anioAnalisis` — Ano seleccionado en pestana Analisis por Ano
- `anioAnalisisFacturacion` — Ano seleccionado en pestana Facturacion (independiente)
- `filtros` — Objeto con: `cliente`, `lineaNegocio`, `cierreAnio`, `cierreMes`
- `facturas` — Array crudo de facturas desde Siigo API
- `notasCredito` — Array crudo de notas credito desde Siigo API
- `facturasProcessed` — Facturas procesadas con balance, dias vencido, horizonte
- `movimientos` — Movimientos bancarios desde Google Sheets

**Funciones principales:**
- `calcularVentasMensuales()` — Ventas/NC por mes para TODOS los anos disponibles
- `calcularVentasMensualesConciliacion()` — Ventas/NC por mes filtrado por `anioAnalisis`
- `aplicarFiltros()` — Filtra `facturasProcessed` por cliente, linea, cierre
- `exportarAnalisisPDF()` — Genera PDF con html2pdf.js (graficas + tablas comparativas)
- `cambiarAnioAnalisis(anio)` — Cambia ano en pestana Analisis (actualiza `anioAnalisis`)
- `cambiarAnioAnalisisFacturacion(anio)` — Cambia ano en pestana Facturacion (independiente)

**Logica del PDF:**
- `anioBase = parseInt(anioAnalisis)` — Ano seleccionado
- `ultimos4Anios = [anioBase-3, ..., anioBase]` — Comparativo 4 anos hacia atras
- `mesAnalisisPDF` — Mes de corte YTD: 12 para anos pasados, mes actual para ano corriente
- Tablas: Centro de Costos y Clientes Recurrentes (YTD, 4 anos)
- Graficas: Ventas Mensuales Netas y Acumuladas (barras agrupadas, 4 anos)
- Tabla CxC y Cartera Real ocultas por solicitud del cliente (`${false && ...}`)

### API (Vercel Serverless Functions)

**api/auth.js** — Autenticacion
- 5 usuarios con passwords hasheadas (SHA-256, salt: "lexia2024")
- JWT propio con HMAC-SHA256, expira en 8 horas
- Acciones: `?action=login` (POST) y `?action=verify` (GET con Bearer token)

**api/siigo.js** — Proxy a Siigo
- Autentica con Siigo API usando credenciales de facturacion@lexia.co
- Paginacion: `?endpoint=invoices&page=1&page_size=100`
- Cachea token de Siigo en la sesion del request

**api/movimientos.js** — Movimientos bancarios
- Lee CSV publico de Google Sheets
- Filtra solo "Nota Credito" sin RC (pendientes de cruce)
- Deduplica por campo "documento" para evitar inflar totales
- Normaliza NITs (quita DV si tiene 10+ digitos)

### Integraciones

| Servicio | Uso | Credenciales |
|----------|-----|-------------|
| Siigo API | Facturas, clientes, NC | facturacion@lexia.co |
| Google Sheets | Movimientos bancarios | CSV publico (no requiere auth) |

## Usuarios del sistema

| Usuario | Nombre | Rol |
|---------|--------|-----|
| carolina | Carolina | Directivo |
| sare | Sare | Directivo |
| josetorresvarela | Jose Torres Varela | Dueno |
| jose.torresf | Jose Torres F | Directivo |
| felipe.torres | Felipe Torres | Directivo |

## Paleta de colores (Lexia)

- Teal oscuro: `#33777D`
- Teal principal: `#418D93`
- Verde menta: `#7BDCB5`
- Verde oscuro: `#003839`
- Verde vibrante: `#4AB866`

## Desarrollo local

```bash
node server.js  # Puerto 3001 — proxy directo a Siigo API
# O
vercel dev      # Puerto 3000 — usa serverless functions
```

El frontend detecta automaticamente el entorno (linea ~2083-2089):
- `localhost:3001` → server.js local (proxy directo)
- `localhost:3000` → Vercel dev (usa /api/siigo)
- HTTPS → Produccion (usa /api/siigo)

## Sprint actual
- **Fase:** Soporte
- **Objetivo:** Consistencia de datos, mejoras UX y PDF
- **Progreso:** Mejoras de consistencia completadas, PDF corregido, demo marca blanca creada

## Ultimo avance
**Sesion:** 2026-04-15
**Branch:** main

Que se hizo:
- Fix datos historicos incompletos: Siigo API sin `date_start` devolvia datos inconsistentes (enero 0 facturas, febrero 16 en vez de 66). Se agrego `date_start` a todas las llamadas (invoices, credit-notes, vouchers)
- Proxy `api/siigo.js` actualizado para pasar parametros extra (date_start, date_end, etc.) a Siigo API
- Fix ventas infladas por IVA: revertido de `f.total` (con IVA) a `qty * price` (base gravable sin IVA) en todos los calculos de ventas. Helper `calcularValorBase(doc)` creado. CxC/cartera mantiene `f.total`
- Paginacion robusta contra rate limiting de Siigo (deteccion de paginas vacias por throttle)
- Analisis de conciliacion completo dashboard vs cierre contable 2022-2025:
  - 2022: -3.03% | 2023: -1.67% | 2024: -3.12% | 2025: +0.45%
  - Diferencia explicada por ajustes contables de cierre, notas debito y reclasificaciones
  - Datos listos para presentar a directora financiera de Lexia

## Pendientes
- [ ] Migrar repo a bi-metrik (actualmente en metrik360)
- [ ] Verificar por que Vercel no hace auto-deploy con push (deploy manual necesario)
- [ ] Migrar www.metrik.com.co a metrik-one si se necesita

## Decisiones clave
| Fecha | Decision | Contexto |
|-------|----------|----------|
| 18/12/2024 | HTML vanilla sin framework | Dashboard single-page, no justifica SPA |
| 18/12/2024 | JWT propio con SHA-256 | Solo 5 usuarios fijos, no justifica Supabase Auth |
| 18/12/2024 | Google Sheets como fuente de movimientos | Cliente ya usa Sheets para tracking |
| 03/03/2026 | Ocultar Cartera Real y CxC del PDF | Solicitud del cliente |
| 09/03/2026 | Var % reemplaza columna Total en tablas PDF | Mas insight comparativo |
| 11/03/2026 | Dominios Vercel centralizados en team metrik-one | Cuenta personal queda limpia |
| 11/03/2026 | metrik.com.co (sin www) sigue en GitHub Pages | No afectado por migracion |
| 18/03/2026 | Siigo prioridad sobre Google Sheets para pagos | Si factura tiene RC o CE en Siigo, MR de Google Sheets se ignora completamente |
| 18/03/2026 | Micro-saldos < $1,000 = pagados | Evita ruido de saldos residuales por redondeo o diferencias menores |
| 15/04/2026 | qty*price (base gravable) para ventas, f.total solo para CxC | Base gravable coincide con contabilidad. f.total incluye IVA, correcto solo para cartera |
| 15/04/2026 | date_start obligatorio en llamadas a Siigo API | Sin filtro de fecha, Siigo devuelve datos inconsistentes (facturas faltantes o con fechas modificadas) |
| 15/04/2026 | Diferencia dashboard vs contabilidad (1-3%) es esperada | Ajustes de cierre, notas debito, reclasificaciones no capturables desde API de facturacion |

## Contexto critico
- El repo en GitHub esta en `metrik360/lexia-facturacion`, no en `bi-metrik/`. Pendiente migrar. Vercel no hace auto-deploy con push — requiere `vercel --prod --scope metrik-one` manual.
- `anioAnalisis` y `anioAnalisisFacturacion` son variables independientes. Cambiar ano en Facturacion NO afecta el PDF (que usa `anioAnalisis` de Analisis por Ano).
- Las tablas CxC y Cartera Real del PDF estan ocultas con `${false && ...}`, no eliminadas. Se pueden reactivar.
- Calculos de ventas usan `calcularValorBase(doc)` = sum(qty*price) sin IVA. CxC/cartera usa `f.total` con IVA. Son dos logicas distintas a proposito.
- `facturasProcessed.total` sigue siendo `f.total` (con IVA) — correcto para cartera.
- Siigo API requiere `date_start` para devolver datos consistentes. Sin este parametro, facturas pueden desaparecer o tener fechas modificadas.
- Conciliacion dashboard vs contabilidad: 2025 cuadra al 0.45% ($20.7M de $4,569M). Anos anteriores 1-3% de diferencia por ajustes contables.
- Demo marca blanca en `/demo` usa misma API de Siigo sin auth. Datos reales pero nombres anonimizados en frontend.

## Notas para continuidad
Al retomar este proyecto, revisar:
1. Este archivo para contexto general
2. `docs/PROJECT_LOG.md` para historial de commits y decisiones
3. `docs/PROJECT_STATE.md` para estado de sprints
4. Git log para ultimos cambios
