// Vercel Serverless Function - Lectura de movimientos bancarios
// Lee datos desde Google Sheets (CSV público)

const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTWrtl7uZ7T-SqddgZ6KDemamvCBb6LDYsniQiUs2jNH7-ngq3Db9mOPwEvMtnJdgNpuTMzn5wHSoOG/pub?gid=0&single=true&output=csv';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        // Leer CSV de Google Sheets
        const response = await fetch(GOOGLE_SHEETS_URL);

        if (!response.ok) {
            throw new Error(`Error fetching Google Sheets: ${response.status}`);
        }

        const csvText = await response.text();
        const movimientos = parseCSV(csvText);

        // Filtrar: solo "Nota Crédito" sin RC (pendientes)
        const pendientes = movimientos.filter(m =>
            m.transaccion === 'Nota Crédito' && !m.rc
        );

        // Deduplicar por Documento: cuando una fila se duplica para
        // mapear múltiples facturas, solo el primer registro conserva
        // el valor. Los duplicados quedan con valor 0 para no inflar totales.
        const documentosVistos = new Set();
        let totalDuplicados = 0;
        const pendientesDedup = pendientes.map(m => {
            const doc = (m.documento || '').trim();
            if (doc && documentosVistos.has(doc)) {
                totalDuplicados++;
                return { ...m, valorOriginal: m.valor, valor: 0, duplicado: true };
            }
            if (doc) documentosVistos.add(doc);
            return m;
        });

        // Calcular resumen (con valores deduplicados)
        const conFactura = pendientesDedup.filter(m => m.factura);
        const sinFacturaConNit = pendientesDedup.filter(m => !m.factura && m.nit);
        const sinNada = pendientesDedup.filter(m => !m.factura && !m.nit);

        const summary = {
            totalRegistros: movimientos.length,
            totalPendientes: pendientesDedup.length,
            duplicadosNeutralizados: totalDuplicados,
            conFactura: conFactura.length,
            sinFacturaConNit: sinFacturaConNit.length,
            sinNada: sinNada.length,
            valorConFactura: conFactura.reduce((sum, m) => sum + (m.valor || 0), 0),
            valorSinFacturaConNit: sinFacturaConNit.reduce((sum, m) => sum + (m.valor || 0), 0),
            valorSinNada: sinNada.reduce((sum, m) => sum + (m.valor || 0), 0)
        };

        return res.status(200).json({
            success: true,
            source: 'google-sheets',
            lastUpdate: new Date().toISOString(),
            data: pendientesDedup,
            summary: summary
        });

    } catch (error) {
        console.error('Error leyendo movimientos:', error);
        return res.status(500).json({
            error: 'Error al leer movimientos',
            details: error.message
        });
    }
}

// Parsear CSV a objetos
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const movimientos = [];

    // Saltar header (línea 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parsear línea CSV (maneja comas dentro de campos entre comillas)
        const fields = parseCSVLine(line);

        if (fields.length < 12) continue;

        const mov = {
            fecha: parseFecha(fields[0]),           // A: Fecha de Sistema
            documento: fields[1]?.trim() || '',     // B: Documento
            descripcion: fields[2]?.trim() || '',   // C: Descripción motivo
            transaccion: fields[3]?.trim() || '',   // D: Transacción
            oficina: fields[4]?.trim() || '',       // E: Oficina de Recaudo
            nit: normalizeNIT(fields[5]),           // F: Nit Originador (normalizado)
            valorCheque: parseValor(fields[6]),     // G: Valor Cheque
            valor: parseValor(fields[7]),           // H: Valor Total
            referencia1: fields[8]?.trim() || '',   // I: Referencia 1
            referencia2: fields[9]?.trim() || '',   // J: Referencia 2
            factura: parseFactura(fields[10]),      // K: # FV (solo 4 dígitos)
            rc: parseRC(fields[11]),                // L: # RC (solo dígitos)
            notas: fields[12]?.trim() || ''         // M: Notas
        };

        // Agregar array de facturas para compatibilidad
        mov.facturas = mov.factura ? [mov.factura] : [];

        movimientos.push(mov);
    }

    return movimientos;
}

// Parsear línea CSV manejando comas en campos entre comillas
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

// Convertir fecha DD/MM/YYYY a YYYY-MM-DD
function parseFecha(fechaStr) {
    if (!fechaStr) return '';
    const clean = fechaStr.trim();
    const match = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
        const [, dia, mes, anio] = match;
        return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return clean;
}

// Parsear valor colombiano: "$ 3.259.290" o "$ 3.259.290,00" -> 3259290
function parseValor(valorStr) {
    if (!valorStr) return 0;
    // Quitar $, espacios, puntos de miles, y convertir coma decimal a punto
    const clean = valorStr
        .replace(/\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

// Normalizar NIT: quitar DV si tiene 10+ dígitos
function normalizeNIT(nitStr) {
    if (!nitStr) return '';
    const clean = nitStr.trim().replace(/[^0-9]/g, '');

    // Si tiene 10+ dígitos, quitar el último (DV)
    if (clean.length >= 10) {
        return clean.slice(0, -1);
    }
    return clean;
}

// Parsear # Factura: extraer solo números (4 dígitos)
function parseFactura(fvStr) {
    if (!fvStr) return null;
    const clean = fvStr.trim().replace(/[^0-9]/g, '');
    if (clean.length >= 3 && clean.length <= 5) {
        return parseInt(clean, 10);
    }
    return null;
}

// Parsear # RC: extraer solo números
function parseRC(rcStr) {
    if (!rcStr) return null;
    const clean = rcStr.trim().replace(/[^0-9]/g, '');
    if (clean.length > 0) {
        return parseInt(clean, 10);
    }
    return null;
}
