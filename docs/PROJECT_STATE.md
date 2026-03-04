---
doc_id: PROJECT_STATE
version: 2.0
updated: 2026-03-03
---

# PROJECT STATE - Dashboard de Cartera Lexia

**Proyecto:** Dashboard de Cartera Lexia Abogados
**Cliente:** Torres Fernandez de Castro Abogados SAS (Lexia)
**Inicio:** 18/12/2024
**Estado:** EN PRODUCCION
**URL:** https://lexia.metrik.com.co

---

## PROGRESO DEL PROYECTO

| Fase | Estado | Fecha | Notas |
|------|--------|-------|-------|
| Discovery | Completado | 18/12/2024 | Requirements definidos |
| Data Spec | Completado | 18/12/2024 | API Siigo validada, 2,276 facturas |
| Design | Completado | 18/12/2024 | Paleta Lexia (teal/verde menta) |
| Code | Completado | 29/12/2024 | HTML + Vercel Serverless Functions |
| QA | Completado | 06/02/2026 | Funcionando en produccion |
| Deploy | Completado | 29/12/2024 | Vercel + subdominio lexia.metrik.com.co |
| Docs | Completado | 03/03/2026 | Normalizacion documental |

---

## SPRINT 1 — CERRADO

**Entregado:**
- Dashboard de cartera con datos en tiempo real via Siigo API
- Sistema de autenticacion con 5 usuarios
- Integracion de movimientos bancarios via Google Sheets
- KPIs: cartera pendiente, saldo real, dinero no identificado
- Cartera por horizonte (0-30, 31-60, 61-90, 91-120, >120 dias)
- Top clientes por cartera
- Cartera por linea de negocio (19 centros de costo)
- Tabla de facturas problematicas (>60 dias)
- Filtros por fecha, cliente, horizonte, linea de negocio
- Responsive (desktop + tablet)

---

## ARQUITECTURA

| Componente | Tecnologia | Ubicacion |
|------------|-----------|-----------|
| Frontend | HTML + CSS + JS (vanilla) | `index.html` |
| API Proxy Siigo | Vercel Serverless Function | `api/siigo.js` |
| Autenticacion | JWT + SHA-256 | `api/auth.js` |
| Movimientos Bancarios | Google Sheets CSV | `api/movimientos.js` |
| Hosting | Vercel | Deploy automatico en push a main |
| Dominio | lexia.metrik.com.co | Vercel DNS |

---

## INTEGRACIONES

### Siigo API
- **Estado:** Conectado
- **Usuario:** facturacion@lexia.co
- **Endpoint:** https://api.siigo.com
- **Datos:** ~2,276 facturas, ~1,548 clientes, 19 centros de costo

### Google Sheets (Movimientos Bancarios)
- **Estado:** Conectado
- **Fuente:** Hoja publica de Google Sheets (CSV)
- **Proposito:** Notas credito pendientes de cruce con facturas

---

## USUARIOS DEL SISTEMA

| Usuario | Nombre | Rol |
|---------|--------|-----|
| carolina | Carolina | Directivo |
| sare | Sare | Directivo |
| josetorresvarela | Jose Torres Varela | Dueno |
| jose.torresf | Jose Torres F | Directivo |
| felipe.torres | Felipe Torres | Directivo |

---

## REPOSITORIO

- **GitHub:** https://github.com/metrik360/lexia-facturacion
- **Branch:** main
- **Deploy:** Automatico via Vercel en push a main

---

*Ultima actualizacion: 03/03/2026*
