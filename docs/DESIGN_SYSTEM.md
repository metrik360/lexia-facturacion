---
doc_id: DESIGN_SYSTEM
version: 2.0
updated: 2026-03-03
---

# DESIGN SYSTEM - Dashboard de Cartera Lexia

**Proyecto:** Dashboard de Cartera
**Cliente:** Lexia Abogados
**Fecha:** 18/12/2024
**Version:** 2.0 (actualizado 03/03/2026)

---

## 1. PALETA DE COLORES

### Colores Principales (implementados en index.html)
| Nombre | Hex | Variable CSS | Uso |
|--------|-----|-------------|-----|
| Negro | `#1E1E1E` | `--negro` | Textos, headers |
| Gris Oscuro | `#333333` | `--gris-oscuro` | Textos secundarios |
| Gris Medio | `#757575` | `--gris-medio` | Bordes, iconos |
| Gris Claro | `#EEEEEE` | `--gris-claro` | Fondos alternos, lineas |
| Blanco | `#FFFFFF` | `--blanco` | Fondo principal |
| Teal Oscuro | `#33777D` | `--teal-oscuro` | Acento corporativo |
| Teal Principal | `#418D93` | `--teal-principal` | Acento principal |
| Verde Menta | `#7BDCB5` | `--verde-menta` | Acento secundario |
| Verde Oscuro | `#003839` | `--verde-oscuro` | Fondo login |
| Verde Vibrante | `#4AB866` | `--verde-vibrante` | Estado OK |

### Colores de Estado
| Nombre | Hex | Uso |
|--------|-----|-----|
| Verde OK | `#22c55e` | Facturas al día (0-30 días) |
| Amarillo Alerta | `#eab308` | Facturas 31-60 días |
| Naranja Warning | `#f97316` | Facturas 61-90 días |
| Rojo Crítico | `#ef4444` | Facturas >90 días |

### Colores de Horizonte
```css
:root {
  --horizonte-0-30: #22c55e;   /* Verde */
  --horizonte-31-60: #eab308;  /* Amarillo */
  --horizonte-61-90: #f97316;  /* Naranja */
  --horizonte-91-120: #ef4444; /* Rojo */
  --horizonte-120-plus: #991b1b; /* Rojo oscuro */
}
```

---

## 2. TIPOGRAFÍA

### Familia
- **Principal:** Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Monospace:** 'SF Mono', Monaco, monospace (para números)

### Escalas
| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| H1 | 24px | 700 | Título principal |
| H2 | 20px | 600 | Títulos de sección |
| H3 | 16px | 600 | Títulos de cards |
| Body | 14px | 400 | Texto general |
| Small | 12px | 400 | Labels, captions |
| KPI Value | 32px | 700 | Números grandes |

---

## 3. COMPONENTES

### 3.1 Cards de KPI

```
┌─────────────────────────────┐
│  CARTERA PENDIENTE          │  ← Label (12px, gris)
│  $1,234,567,890             │  ← Valor (32px, negro, bold)
│  ▲ 12.5% vs mes anterior    │  ← Cambio (12px, verde/rojo)
└─────────────────────────────┘
```

**CSS:**
```css
.kpi-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  min-width: 200px;
}

.kpi-label {
  font-size: 12px;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  font-variant-numeric: tabular-nums;
}
```

### 3.2 Barra de Horizonte

```
┌────────────────────────────────────────────────────────────┐
│ ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 0-30d (45%)   31-60d (20%)  61-90d (15%)  91-120d  >120d  │
└────────────────────────────────────────────────────────────┘
```

### 3.3 Tabla de Facturas

```
┌──────────┬────────────────────┬──────────────┬───────┬────────┐
│ Factura  │ Cliente            │ Valor        │ Días  │ Estado │
├──────────┼────────────────────┼──────────────┼───────┼────────┤
│ FE-2225  │ EMPRESA DESARROLLO │ $12,618,103  │  1    │ 🟢     │
│ FE-2180  │ CLIENTE MOROSO     │ $5,200,000   │  85   │ 🟠     │
│ FE-2150  │ OTRO CLIENTE       │ $3,800,000   │  125  │ 🔴     │
└──────────┴────────────────────┴──────────────┴───────┴────────┘
```

**Estilos de fila según horizonte:**
```css
.row-ok { background: #f0fdf4; }      /* Verde claro */
.row-warning { background: #fefce8; } /* Amarillo claro */
.row-danger { background: #fef2f2; }  /* Rojo claro */
```

---

## 4. LAYOUT

### 4.1 Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                     [🔄] │
│ [LOGO LEXIA]              Dashboard de Cartera                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ CARTERA  │  │ SALDO    │  │ FACTURAS │  │ CLIENTES │        │
│  │ TOTAL    │  │ REAL     │  │ VENCIDAS │  │ ACTIVOS  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CARTERA POR HORIZONTE (Barra apilada)                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ TOP CLIENTES            │  │ CARTERA POR LÍNEA           │  │
│  │ (Lista ordenada)        │  │ (Gráfico dona/barras)       │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ FACTURAS PROBLEMÁTICAS (>60 días)                          │ │
│  │ (Tabla con detalle)                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER: Última actualización: 18/12/2024 10:30 AM              │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Grid System

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px;
}

.kpi-row {
  grid-column: span 4;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.chart-half {
  grid-column: span 2;
}

.chart-full {
  grid-column: span 4;
}
```

---

## 5. ICONOGRAFÍA

| Elemento | Icono | Código |
|----------|-------|--------|
| Refresh | 🔄 | `&#x1F504;` |
| OK | 🟢 | `&#x1F7E2;` |
| Warning | 🟠 | `&#x1F7E0;` |
| Danger | 🔴 | `&#x1F534;` |
| Dinero | 💰 | `&#x1F4B0;` |
| Calendario | 📅 | `&#x1F4C5;` |
| Cliente | 👤 | `&#x1F464;` |

---

## 6. FORMATO DE NÚMEROS

### Moneda (COP)
```javascript
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
// Resultado: $12.618.103
```

### Porcentajes
```javascript
const formatPercent = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};
// Resultado: 45,5%
```

---

## 7. ESTADOS DE CARGA

### Loading
```
┌─────────────────────────────────────┐
│                                     │
│      ◐ Cargando datos...            │
│      ████████░░░░░░ 65%             │
│                                     │
└─────────────────────────────────────┘
```

### Error
```
┌─────────────────────────────────────┐
│                                     │
│  ⚠️ Error al cargar datos           │
│  [Reintentar]                       │
│                                     │
└─────────────────────────────────────┘
```

### Sin datos
```
┌─────────────────────────────────────┐
│                                     │
│  📭 No hay facturas pendientes      │
│                                     │
└─────────────────────────────────────┘
```

---

## 8. RESPONSIVE

### Breakpoints
| Tamaño | Ancho | Columnas |
|--------|-------|----------|
| Desktop | >1200px | 4 |
| Tablet | 768-1199px | 2 |
| Mobile | <768px | 1 |

---

## 9. LOGO

**Ubicacion:** `/assets/logo-lexia.png`
**Tamano en header:** max-height: 40px
**Tamano en login:** height: 60px

---

*Documento generado por METRIK Design Agent*
*Fecha: 18/12/2024 — Actualizado: 03/03/2026*
