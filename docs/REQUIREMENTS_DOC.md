---
doc_id: REQUIREMENTS_DOC
version: 2.0
updated: 2026-03-03
---

# REQUIREMENTS DOC - Dashboard de Cartera Lexia

**Proyecto:** Dashboard de Cartera
**Cliente:** Lexia Abogados (Torres Fernandez de Castro Abogados SAS)
**Fecha:** 18/12/2024
**Version:** 2.0 (actualizado 03/03/2026)

---

## 1. RESUMEN EJECUTIVO

### Objetivo Principal
Construir un dashboard de cartera para Lexia (firma de abogados) que permita a Don José (dueño) y al equipo directivo visualizar el estado de la cartera **en tiempo real**, sin depender de reportes manuales.

### Usuarios Objetivo
| Usuario | Rol | Necesidad Principal |
|---------|-----|---------------------|
| Don José | Dueño | Visión ejecutiva de cartera |
| Hijos | Directivos | Seguimiento operativo |
| Asesor Financiero | Finanzas | Análisis y proyecciones |

### Problema que Resuelve
- Eliminar dependencia de reportes manuales
- Visibilidad en tiempo real del estado de cartera
- Identificación rápida de facturas problemáticas (>60 días)
- Control de dinero no identificado

---

## 2. REQUERIMIENTOS FUNCIONALES

### RF-01: Análisis por Horizontes de Tiempo
**Prioridad:** ALTA

| Horizonte | Rango | Clasificación |
|-----------|-------|---------------|
| 1 | 0-30 días | Normal |
| 2 | 31-60 días | Normal |
| 3 | 61-90 días | ⚠️ Problemático |
| 4 | 91-120 días | ⚠️ Problemático |
| 5 | >120 días | 🔴 Crítico |

**Reglas de negocio:**
- Facturas >60 días se destacan visualmente (color diferente)
- Debe permitir drill-down hasta el ID de factura específica
- Calcular días desde fecha de factura vs fecha actual

---

### RF-02: Manejo de Dinero No Identificado
**Prioridad:** ALTA

**Concepto:** Ingresos de clientes que no están cruzados con facturas específicas.

**Fórmula:**
```
Saldo Real = Cartera Pendiente - Dinero No Identificado
```

**Reglas de negocio:**
- Plazo operativo: máximo 15 días para identificar pagos desde el desembolso
- Mostrar alertas para dinero no identificado > 15 días
- Fuente: Excel de movimientos bancarios (manual)

---

### RF-03: Limpieza de Centavos Vivos
**Prioridad:** MEDIA

**Regla:**
```
SI (saldo_factura / valor_total_proyecto) < 0.5%
ENTONCES saldo_factura = 0 (marcar como pagada)
```

**Propósito:** Resolver cruces incompletos entre facturas, pagos y recaudos.

---

### RF-04: KPIs Principales
**Prioridad:** ALTA

| KPI | Descripción | Cálculo |
|-----|-------------|---------|
| Cartera Pendiente Total | Suma de balances pendientes | SUM(balance) |
| Cartera por Horizonte | Cartera segmentada por antigüedad | SUM(balance) GROUP BY horizonte |
| Top Clientes | Clientes con mayor cartera | ORDER BY balance DESC |
| Cartera por Línea de Negocio | Segmentación por centro de costo | SUM(balance) GROUP BY cost_center |
| Total Ventas (Facturación) | Facturación por período | SUM(total) |
| Ventas por Línea de Negocio | Facturación por centro de costo | SUM(total) GROUP BY cost_center |

---

### RF-05: Vistas y Drill-Down
**Prioridad:** ALTA

**Niveles de navegación:**
1. **Vista Ejecutiva** - KPIs generales
2. **Vista por Cliente** - Cartera desglosada por cliente
3. **Vista por Horizonte** - Facturas agrupadas por antigüedad
4. **Vista Detalle** - Factura individual con todos los datos

**Drill-down requerido:**
- Click en cliente → Ver facturas del cliente
- Click en horizonte → Ver facturas en ese rango
- Click en factura → Ver detalle completo

---

### RF-06: Filtros
**Prioridad:** MEDIA — IMPLEMENTADO

| Filtro | Tipo | Valores |
|--------|------|---------|
| Rango de fechas | Fecha | Desde - Hasta |
| Cliente | Select | Lista de clientes |
| Horizonte | Multi-select | 30, 60, 90, 120, >120 |
| Linea de negocio | Select | Centro de costo |
| Estado | Select | Pendiente / Pagada |

---

### RF-07: Sistema de Autenticacion
**Prioridad:** ALTA — IMPLEMENTADO

| Aspecto | Detalle |
|---------|---------|
| Metodo | JWT con SHA-256 (salt: lexia2024) |
| Expiracion | 8 horas |
| Usuarios | 5 (carolina, sare, josetorresvarela, jose.torresf, felipe.torres) |
| Endpoint | `/api/auth?action=login` (POST), `/api/auth?action=verify` (GET) |

**Flujo:**
1. Usuario ingresa usuario + contrasena en pantalla de login
2. Se hashea contrasena con SHA-256 (salt + password)
3. Se compara con hash almacenado en serverless function
4. Si coincide, se genera JWT firmado con HMAC-SHA256
5. Token se almacena en localStorage del navegador
6. Cada carga del dashboard verifica token vigente

---

### RF-08: Integracion de Movimientos Bancarios
**Prioridad:** ALTA — IMPLEMENTADO

| Aspecto | Detalle |
|---------|---------|
| Fuente | Google Sheets (CSV publico) |
| Endpoint | `/api/movimientos` (GET) |
| Proposito | Notas credito pendientes de cruce con facturas |

**Logica:**
- Lee CSV de Google Sheets en tiempo real
- Filtra solo transacciones tipo "Nota Credito" sin RC (recibo de caja)
- Clasifica en: con factura, sin factura con NIT, sin nada
- Calcula resumen de valores por categoria

---

## 3. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Diseño Visual
- **Paleta de colores:** Gris y Negro (corporativo)
- **Logo:** Incluir logo de LEXIA (✅ Descargado: assets/logo-lexia.png)
- **Estilo:** Profesional, minimalista
- **Responsive:** Adaptable a desktop y tablet

### RNF-02: Performance
- Carga inicial < 3 segundos
- Actualización de datos: On-demand (botón refresh)
- Paginación para listas > 50 registros

### RNF-03: Seguridad
- Dashboard privado con login (JWT)
- 5 usuarios autorizados con contrasenas hasheadas
- Token expira en 8 horas
- Proxy serverless para API Siigo (credenciales no expuestas al frontend)

---

## 4. FUENTES DE DATOS

### 4.1 SIIGO (Fuente Principal)
| Aspecto | Detalle |
|---------|---------|
| Estado | ✅ Conectado y validado |
| Endpoint | https://api.siigo.com |
| Usuario | facturacion@lexia.co |
| Datos disponibles | 2,276 facturas |
| Actualización | Tiempo real vía API |

**Endpoints a usar:**
- `GET /v1/invoices` - Facturas
- `GET /v1/customers` - Clientes
- `GET /v1/products` - Productos/Servicios

**Campos clave de facturas:**
```json
{
  "id": "uuid",
  "prefix": "FE",
  "number": 2225,
  "date": "2025-12-17",
  "customer": {
    "id": "uuid",
    "identification": "860002527"
  },
  "cost_center": 166,
  "total": 12618103.28,
  "balance": 12618103.28,
  "payments": [...],
  "retentions": [...]
}
```

### 4.2 Google Sheets - Movimientos Bancarios (Complementario)
| Aspecto | Detalle |
|---------|---------|
| Estado | Conectado e implementado |
| Fuente | Google Sheets publicado como CSV |
| Proposito | Notas credito pendientes de cruce con facturas |
| Endpoint | `/api/movimientos` |

**Campos del CSV:**

| Columna | Campo | Descripcion |
|---------|-------|-------------|
| A | fecha | Fecha de sistema (DD/MM/YYYY) |
| B | documento | Numero de documento |
| C | descripcion | Descripcion motivo |
| D | transaccion | Tipo (Nota Credito, etc.) |
| E | oficina | Oficina de recaudo |
| F | nit | NIT originador |
| G | valorCheque | Valor cheque |
| H | valor | Valor total |
| I | referencia1 | Referencia 1 |
| J | referencia2 | Referencia 2 |
| K | factura | Numero de factura (FV) |
| L | rc | Numero de recibo de caja |
| M | notas | Notas adicionales |

**Logica de filtrado:**
- Solo "Nota Credito" sin RC se consideran pendientes
- Se clasifican en: con factura, sin factura con NIT, sin identificar

---

## 5. ARQUITECTURA PROPUESTA

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD LEXIA                       │
│                   (HTML/CSS/JS)                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌────────────┐ │
│   │   KPIs      │    │   Tablas    │    │  Gráficos  │ │
│   │  Cartera    │    │  Clientes   │    │  Horizonte │ │
│   └─────────────┘    └─────────────┘    └────────────┘ │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    CAPA DE DATOS                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────────┐         ┌──────────────────────┐ │
│   │   SIIGO API     │         │  Excel Movimientos   │ │
│   │  (Principal)    │         │   (Complementario)   │ │
│   └─────────────────┘         └──────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 6. MOCKUP CONCEPTUAL

```
┌────────────────────────────────────────────────────────────────┐
│  [LOGO ELEXIA]              DASHBOARD DE CARTERA        [🔄]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ CARTERA      │  │ SALDO REAL   │  │ DIN. NO ID   │        │
│  │ PENDIENTE    │  │              │  │              │        │
│  │ $XXX,XXX,XXX │  │ $XXX,XXX,XXX │  │ $XX,XXX,XXX  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  CARTERA POR HORIZONTE                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │ 0-30d    31-60d    61-90d    91-120d    >120d         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  TOP CLIENTES POR CARTERA          │  CARTERA POR LÍNEA      │
│  ┌─────────────────────────────┐   │  ┌────────────────────┐ │
│  │ 1. Cliente A    $XX,XXX,XXX │   │  │ Litigios    45%    │ │
│  │ 2. Cliente B    $XX,XXX,XXX │   │  │ Consultoría 30%    │ │
│  │ 3. Cliente C    $XX,XXX,XXX │   │  │ Cumplim.    25%    │ │
│  └─────────────────────────────┘   │  └────────────────────┘ │
│                                                                │
│  FACTURAS PROBLEMÁTICAS (>60 días)                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Factura   │ Cliente      │ Valor       │ Días │ Acción │  │
│  │ FE-2180   │ Cliente X    │ $5,200,000  │  85  │  [Ver] │  │
│  │ FE-2165   │ Cliente Y    │ $3,800,000  │  92  │  [Ver] │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. ENTREGABLES

| # | Entregable | Formato | Fase |
|---|------------|---------|------|
| 1 | REQUIREMENTS_DOC.md | Markdown | Discovery ✅ |
| 2 | DATA_SPEC.md | Markdown | Data |
| 3 | DESIGN_SYSTEM.md | Markdown | Design |
| 4 | dashboard/index.html | HTML/CSS/JS | Code |
| 5 | QA_REPORT.md | Markdown | QA |
| 6 | DEPLOY_REPORT.md | Markdown | Deploy |

---

## 8. PENDIENTES Y RIESGOS

### Pendientes (Sprint 1)
- [x] Definir estructura de movimientos bancarios — Implementado via Google Sheets CSV
- [x] Obtener logo de LEXIA en formato PNG — assets/logo-lexia.png
- [x] Mapear centros de costo a lineas de negocio — 19 centros mapeados

### Riesgos activos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Token Siigo expira | Media | Alto | Re-auth automatico en serverless function |
| Google Sheets cambia estructura | Baja | Medio | Parser robusto con validacion de campos |

---

## 9. APROBACION

| Rol | Nombre | Fecha | Estado |
|-----|--------|-------|--------|
| Project Manager | Claude/METRIK | 18/12/2024 | Generado |
| Cliente | Mauricio | 06/02/2026 | Aprobado (QA en produccion) |

---

*Documento generado por METRIK Discovery Agent*
*Fecha: 18/12/2024 — Actualizado: 03/03/2026*
