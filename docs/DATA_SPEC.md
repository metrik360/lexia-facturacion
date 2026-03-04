---
doc_id: DATA_SPEC
version: 2.0
updated: 2026-03-03
---

# DATA SPEC - Dashboard de Cartera Lexia

**Proyecto:** Dashboard de Cartera
**Cliente:** Lexia Abogados
**Fecha:** 18/12/2024
**Version:** 2.0 (actualizado 03/03/2026)

---

## 1. FUENTES DE DATOS

### 1.1 SIIGO API (Fuente Principal)

| Campo | Valor |
|-------|-------|
| **Base URL** | https://api.siigo.com |
| **Auth Endpoint** | POST /auth |
| **Usuario** | facturacion@lexia.co |
| **Access Key** | NmYyMDc3YjgtNzBhMS00OTM1LWI4ZGUtYzFmMzkyYzAwNjExOnJ+ZDFRMWtDN1E= |
| **Token Validity** | 24 horas (86,400 segundos) |
| **Header Requerido** | Partner-Id: Empresa |

**Volumen de datos:**
- Total facturas: **2,276**
- Total clientes: **1,548**
- Centros de costo: **19**

---

## 2. ENDPOINTS UTILIZADOS

### 2.1 Autenticación

```http
POST https://api.siigo.com/auth
Content-Type: application/json

{
  "username": "facturacion@lexia.co",
  "access_key": "NmYyMDc3YjgtNzBhMS00OTM1LWI4ZGUtYzFmMzkyYzAwNjExOnJ+ZDFRMWtDN1E="
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 86400,
  "token_type": "Bearer",
  "scope": "SiigoAPI"
}
```

---

### 2.2 Facturas (Invoices)

```http
GET https://api.siigo.com/v1/invoices?page={page}&page_size={size}
Authorization: Bearer {token}
Partner-Id: Empresa
```

**Parámetros de paginación:**
- `page`: Número de página (1-based)
- `page_size`: Máximo 100 registros por página

**Campos relevantes de respuesta:**

| Campo | Tipo | Descripción | Uso en Dashboard |
|-------|------|-------------|------------------|
| `id` | string (UUID) | ID único de factura | Identificador |
| `prefix` | string | Prefijo (FE) | Display |
| `number` | int | Número secuencial | Display |
| `name` | string | Nombre completo (FV-2-2225) | Display |
| `date` | string | Fecha de factura (YYYY-MM-DD) | Cálculo de horizonte |
| `customer.id` | string (UUID) | ID del cliente | Agrupación |
| `customer.identification` | string | NIT del cliente | Display |
| `cost_center` | int | Centro de costo (línea negocio) | Agrupación |
| `total` | decimal | Valor total factura | KPI ventas |
| `balance` | decimal | Saldo pendiente | KPI cartera |
| `payments[]` | array | Formas de pago | Referencia |
| `retentions[]` | array | Retenciones aplicadas | Referencia |
| `stamp.status` | string | Estado DIAN | Filtro |
| `metadata.created` | datetime | Fecha creación | Referencia |

**Ejemplo de factura:**
```json
{
  "id": "c000d302-4b9d-4e94-9d5a-9e3045d9de2d",
  "prefix": "FE",
  "number": 2225,
  "name": "FV-2-2225",
  "date": "2025-12-17",
  "customer": {
    "id": "2806c08d-0e4d-4745-aa26-444d13ce66bb",
    "identification": "860002527"
  },
  "cost_center": 166,
  "total": 12618103.28,
  "balance": 12618103.28,
  "payments": [
    {"id": 3728, "name": "Crédito", "value": 12618103.28, "due_date": "2026-01-16"}
  ],
  "retentions": [
    {"id": 18080, "name": "ReteICA 8.66", "type": "ReteICA", "percentage": 8.66, "value": 104783.84},
    {"id": 8718, "name": "ReteIVA 15%", "type": "ReteIVA", "percentage": 15.0, "value": 344842.88}
  ]
}
```

---

### 2.3 Clientes (Customers)

```http
GET https://api.siigo.com/v1/customers?page={page}&page_size={size}
Authorization: Bearer {token}
Partner-Id: Empresa
```

**Campos relevantes:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | ID único cliente |
| `identification` | string | NIT/Cédula |
| `name[]` | array | Nombre (puede ser 1 o 2 elementos) |
| `person_type` | string | "Company" o "Person" |
| `active` | boolean | Estado activo |
| `address.city.city_name` | string | Ciudad |
| `contacts[].email` | string | Email de contacto |

---

### 2.4 Centros de Costo (Cost Centers) = Líneas de Negocio

```http
GET https://api.siigo.com/v1/cost-centers
Authorization: Bearer {token}
Partner-Id: Empresa
```

**Mapeo Completo:**

| ID | Código | Nombre en Siigo | Línea de Negocio (Display) |
|----|--------|-----------------|---------------------------|
| 158 | a-2 | Administrativos | Administrativos |
| 159 | a-3 | Laborales | Laborales |
| 162 | a-1 | Civiles | Civiles |
| 164 | B-1 | ARBITRALES | Arbitrales |
| 166 | C-1 | SANCIONATORIO ADMINISTRATIVO | Sancionatorio |
| 168 | D-1 | RESPONSABILIDAD FISCAL | Responsabilidad Fiscal |
| 170 | E-1 | CONSULTORIA | Consultoría |
| 171 | a-4 | Ejecutivos | Ejecutivos |
| 173 | F-1 | INNOVACION LEGAL | Innovación Legal |
| 175 | G-1 | ABOGADOS DIGITALES | Abogados Digitales |
| 1511 | a-5 | Proyecto 600 | Proyecto 600 |
| 1626 | a-6 | Nuevo Civil Administrativo | Civil Administrativo |
| 1627 | b-2 | Nuevo Arbitral | Arbitral (Nuevo) |
| 1629 | a-7 | Nuevo Civil | Civil (Nuevo) |
| 1630 | a-8 | Nuevo Civil Ejecutivo | Civil Ejecutivo |
| 1631 | a-9 | Nuevo Civil Laboral | Civil Laboral |
| 1632 | c-2 | Nuevo Sancionatorio | Sancionatorio (Nuevo) |
| 1633 | d-2 | Nuevo Responsabilidad Fiscal | Resp. Fiscal (Nuevo) |
| 1636 | f-2 | Nuevo Innovación Legal | Innov. Legal (Nuevo) |

---

## 3. MODELO DE DATOS DEL DASHBOARD

### 3.1 Estructura de Factura Procesada

```javascript
{
  // Datos originales
  id: "c000d302-4b9d-4e94-9d5a-9e3045d9de2d",
  numero: "FE-2225",
  fecha: "2025-12-17",

  // Cliente
  clienteId: "2806c08d-0e4d-4745-aa26-444d13ce66bb",
  clienteNit: "860002527",
  clienteNombre: "EMPRESA DE DESARROLLO URBANO...", // Se obtiene de customers

  // Línea de negocio
  costCenterId: 166,
  lineaNegocio: "Sancionatorio",

  // Valores
  total: 12618103.28,
  balance: 12618103.28,

  // Campos calculados
  diasVencimiento: 1,  // Calculado: hoy - fecha
  horizonte: "0-30",   // Calculado basado en diasVencimiento
  estaVencida: false,  // diasVencimiento > 60
  esProblematica: false // diasVencimiento > 60
}
```

### 3.2 Cálculo de Horizontes

```javascript
function calcularHorizonte(fechaFactura) {
  const hoy = new Date();
  const fecha = new Date(fechaFactura);
  const dias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));

  if (dias <= 30) return { rango: "0-30", label: "0-30 días", orden: 1 };
  if (dias <= 60) return { rango: "31-60", label: "31-60 días", orden: 2 };
  if (dias <= 90) return { rango: "61-90", label: "61-90 días", orden: 3, problematica: true };
  if (dias <= 120) return { rango: "91-120", label: "91-120 días", orden: 4, problematica: true };
  return { rango: ">120", label: "> 120 días", orden: 5, problematica: true };
}
```

### 3.3 Limpieza de Centavos Vivos

```javascript
function limpiarCentavos(balance, totalProyecto) {
  const porcentaje = (balance / totalProyecto) * 100;
  if (porcentaje < 0.5) {
    return 0; // Marcar como pagada
  }
  return balance;
}
```

---

## 4. AGREGACIONES REQUERIDAS

### 4.1 KPIs Principales

```javascript
// Cartera Pendiente Total
const carteraPendiente = facturas.reduce((sum, f) => sum + f.balance, 0);

// Cartera por Horizonte
const carteraPorHorizonte = facturas.reduce((acc, f) => {
  const h = calcularHorizonte(f.fecha);
  acc[h.rango] = (acc[h.rango] || 0) + f.balance;
  return acc;
}, {});

// Top Clientes por Cartera
const topClientes = Object.entries(
  facturas.reduce((acc, f) => {
    acc[f.clienteId] = (acc[f.clienteId] || 0) + f.balance;
    return acc;
  }, {})
).sort((a, b) => b[1] - a[1]).slice(0, 10);

// Cartera por Línea de Negocio
const carteraPorLinea = facturas.reduce((acc, f) => {
  const linea = LINEAS_NEGOCIO[f.costCenterId] || "Sin asignar";
  acc[linea] = (acc[linea] || 0) + f.balance;
  return acc;
}, {});

// Total Ventas (Facturación)
const totalVentas = facturas.reduce((sum, f) => sum + f.total, 0);
```

---

## 5. FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────────────┐
│                        DASHBOARD                             │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PROCESAMIENTO                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Calcular     │  │ Limpiar      │  │ Agregar por      │  │
│  │ Horizontes   │  │ Centavos     │  │ Cliente/Línea    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE ENRIQUECIMIENTO                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ JOIN: Facturas + Clientes + Centros de Costo         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE EXTRACCIÓN                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ /invoices   │  │ /customers  │  │ /cost-centers       │ │
│  │ (2,276)     │  │ (1,548)     │  │ (19)                │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                       SIIGO API                              │
│              https://api.siigo.com                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. ESTRATEGIA DE CARGA

### 6.1 Carga Inicial
1. Autenticar y obtener token
2. Cargar centros de costo (cache estático)
3. Cargar clientes (paginado, 100 por página)
4. Cargar facturas (paginado, 100 por página)
5. Enriquecer y procesar datos
6. Renderizar dashboard

### 6.2 Actualización (Refresh)
- Botón manual "Actualizar datos"
- Re-obtener token si ha expirado
- Recargar solo facturas (datos más dinámicos)
- Mantener cache de clientes y centros de costo

### 6.3 Consideraciones de Performance
- Total de páginas para facturas: ~23 páginas (2,276 / 100)
- Total de páginas para clientes: ~16 páginas (1,548 / 100)
- Tiempo estimado carga completa: 15-30 segundos
- Estrategia: Mostrar loading con progreso

---

## 7. MANEJO DE ERRORES

| Error | Código | Manejo |
|-------|--------|--------|
| Token expirado | 401 | Re-autenticar automáticamente |
| Rate limit | 429 | Esperar y reintentar |
| Error de red | Network | Mostrar mensaje, botón reintentar |
| Sin datos | 200 empty | Mostrar "No hay datos" |

---

## 8. DATOS DE PRUEBA

### Factura de ejemplo (para testing):
```json
{
  "id": "test-001",
  "numero": "FE-TEST",
  "fecha": "2024-10-15",
  "clienteNit": "860002527",
  "clienteNombre": "CLIENTE PRUEBA",
  "costCenterId": 166,
  "lineaNegocio": "Sancionatorio",
  "total": 10000000,
  "balance": 5000000,
  "diasVencimiento": 64,
  "horizonte": "61-90",
  "esProblematica": true
}
```

---

## 9. FUENTE COMPLEMENTARIA: MOVIMIENTOS BANCARIOS

### Google Sheets (CSV publico)

| Campo | Valor |
|-------|-------|
| **Tipo** | Google Sheets publicado como CSV |
| **Endpoint** | `/api/movimientos` (GET) |
| **Proposito** | Notas credito pendientes de cruce con facturas |

**Campos del CSV:**

| Columna | Campo | Tipo | Descripcion |
|---------|-------|------|-------------|
| A | fecha | date | Fecha de sistema (DD/MM/YYYY -> YYYY-MM-DD) |
| B | documento | string | Numero de documento |
| C | descripcion | string | Descripcion motivo |
| D | transaccion | string | Tipo de transaccion |
| E | oficina | string | Oficina de recaudo |
| F | nit | string | NIT originador (normalizado sin DV) |
| G | valorCheque | number | Valor cheque (parseado de formato COP) |
| H | valor | number | Valor total (parseado de formato COP) |
| I | referencia1 | string | Referencia 1 |
| J | referencia2 | string | Referencia 2 |
| K | factura | int/null | Numero de factura FV (3-5 digitos) |
| L | rc | int/null | Numero de recibo de caja |
| M | notas | string | Notas adicionales |

**Logica de procesamiento (`api/movimientos.js`):**
1. Fetch CSV desde Google Sheets
2. Parsear CSV (manejo de comas en comillas)
3. Filtrar: solo `transaccion === "Nota Credito"` sin RC
4. Clasificar pendientes en: con factura, sin factura con NIT, sin nada
5. Retornar data + summary con totales por categoria

---

## 10. COMPLETADO

- [x] Validar conexion API Siigo
- [x] Documentar endpoints
- [x] Mapear centros de costo (19 centros)
- [x] Crear DESIGN_SYSTEM.md
- [x] Desarrollar dashboard
- [x] Implementar autenticacion (5 usuarios)
- [x] Integrar movimientos bancarios (Google Sheets)
- [x] Deploy a produccion (lexia.metrik.com.co)

---

*Documento generado por METRIK Data Agent*
*Fecha: 18/12/2024 — Actualizado: 03/03/2026*
