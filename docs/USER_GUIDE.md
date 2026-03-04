---
doc_id: USER_GUIDE
version: 1.0
updated: 2026-03-03
---

# GUIA DE USUARIO - Dashboard de Cartera Lexia

**URL:** https://lexia.metrik.com.co
**Soporte:** mauricio.moreno@metrik.com.co | +57 315 950 9103

---

## 1. ACCESO

### Ingresar al dashboard

1. Abrir https://lexia.metrik.com.co en el navegador
2. Ingresar usuario y contrasena asignados
3. Hacer clic en "Ingresar"

### Sesion

- La sesion dura 8 horas
- Si la sesion expira, el sistema redirige al login automaticamente
- Para cerrar sesion manualmente, recargar la pagina o cerrar el navegador

---

## 2. PANEL PRINCIPAL

Al ingresar se muestran los KPIs principales:

| KPI | Que muestra |
|-----|-------------|
| Cartera Pendiente | Total de saldos pendientes de todas las facturas |
| Saldo Real | Cartera pendiente menos dinero no identificado |
| Dinero No Identificado | Pagos recibidos sin cruzar con factura especifica |
| Facturas Vencidas | Cantidad de facturas con mas de 60 dias |

---

## 3. CARTERA POR HORIZONTE

Barra visual que muestra la distribucion de cartera por antiguedad:

| Horizonte | Rango | Color | Significado |
|-----------|-------|-------|-------------|
| 0-30 dias | Normal | Verde | Al dia |
| 31-60 dias | Normal | Amarillo | Proximo a vencer |
| 61-90 dias | Problematico | Naranja | Requiere atencion |
| 91-120 dias | Problematico | Rojo | Critico |
| >120 dias | Critico | Rojo oscuro | Gestion urgente |

---

## 4. SECCIONES DEL DASHBOARD

### Top Clientes
Lista de los clientes con mayor cartera pendiente, ordenados de mayor a menor.

### Cartera por Linea de Negocio
Distribucion de cartera por centro de costo (area de practica): Civiles, Laborales, Arbitrales, Sancionatorio, Consultoria, etc.

### Facturas Problematicas
Tabla con facturas que tienen mas de 60 dias. Muestra: numero de factura, cliente, valor, dias de antiguedad.

### Movimientos Bancarios Pendientes
Notas credito recibidas que aun no se han cruzado con facturas en Siigo. Se clasifican en:
- Con factura identificada
- Sin factura pero con NIT
- Sin identificar

---

## 5. FILTROS

| Filtro | Como funciona |
|--------|---------------|
| Rango de fechas | Filtra facturas por fecha de emision |
| Cliente | Seleccionar un cliente especifico |
| Horizonte | Filtrar por rango de antiguedad |
| Linea de negocio | Filtrar por centro de costo |

---

## 6. ACTUALIZAR DATOS

- Los datos se cargan de Siigo en tiempo real al abrir el dashboard
- Para refrescar datos, usar el boton de actualizar o recargar la pagina
- Los movimientos bancarios se leen de Google Sheets cada vez que se carga el dashboard

---

## 7. PREGUNTAS FRECUENTES

**Los numeros no coinciden con Siigo**
Los datos se cargan en tiempo real desde Siigo. Si hay diferencia, verificar que Siigo este actualizado y recargar el dashboard.

**No puedo ingresar**
Verificar que el usuario y contrasena sean correctos. Si el problema persiste, contactar a soporte.

**La pagina tarda en cargar**
La primera carga descarga todas las facturas de Siigo (~2,200+). Esto puede tomar 15-30 segundos. Las cargas siguientes son mas rapidas.

**Que son los "centavos vivos"?**
Son saldos residuales menores al 0.5% del valor de la factura. El dashboard los limpia automaticamente y marca esas facturas como pagadas.

---

*Documento generado por METRIK*
*Fecha: 03/03/2026*
