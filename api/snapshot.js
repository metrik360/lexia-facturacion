// Snapshot Siigo para vista junta
// - action=refresh: hace pull completo de Siigo y guarda en Vercel Blob (cron 2x/dia)
// - action=read: devuelve URL del blob + timestamp para que el frontend lo consuma
//
// Env vars requeridas:
//   SIIGO_USERNAME, SIIGO_ACCESS_KEY  -> creds Siigo
//   BLOB_READ_WRITE_TOKEN              -> auto-inyectado por Vercel cuando se habilita Blob
//   CRON_SECRET (opcional)             -> si esta seteado, refresh exige Authorization Bearer

import { put, head } from '@vercel/blob';

export const maxDuration = 300;

const BLOB_KEY = 'lexia/snapshot.json';

async function autenticarSiigo() {
    const username = process.env.SIIGO_USERNAME;
    const accessKey = process.env.SIIGO_ACCESS_KEY;
    if (!username || !accessKey) {
        throw new Error('Faltan SIIGO_USERNAME o SIIGO_ACCESS_KEY en env vars');
    }
    const r = await fetch('https://api.siigo.com/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, access_key: accessKey })
    });
    if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Siigo auth failed: ${r.status} ${txt.slice(0, 200)}`);
    }
    const data = await r.json();
    return data.access_token;
}

async function fetchAllPages(endpoint, token, dateStart) {
    const all = [];
    let page = 1;
    let total = 0;
    const pageSize = 100;

    while (true) {
        const dateQ = dateStart ? `&date_start=${dateStart}` : '';
        const url = `https://api.siigo.com/v1/${endpoint}?page=${page}&page_size=${pageSize}${dateQ}`;
        const r = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Partner-Id': 'Empresa',
                'Content-Type': 'application/json'
            }
        });

        if (!r.ok) {
            const txt = await r.text();
            throw new Error(`Siigo ${endpoint} page ${page} failed: ${r.status} ${txt.slice(0, 200)}`);
        }

        const data = await r.json();
        const results = data.results || [];
        all.push(...results);

        const newTotal = data.pagination?.total_results || 0;
        if (newTotal > 0) total = newTotal;

        if (results.length === 0) break;
        if (total > 0 && all.length >= total) break;

        page++;

        if (page > 500) {
            throw new Error(`Safety break: ${endpoint} excedio 500 paginas`);
        }
    }

    return all;
}

async function refresh() {
    const startedAt = Date.now();
    const token = await autenticarSiigo();
    const dateStart = (new Date().getFullYear() - 5) + '-01-01';

    const customers = await fetchAllPages('customers', token, null);
    const invoices = await fetchAllPages('invoices', token, dateStart);
    const creditNotes = await fetchAllPages('credit-notes', token, dateStart);
    const vouchers = await fetchAllPages('vouchers', token, dateStart);

    const snapshot = {
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        counts: {
            customers: customers.length,
            invoices: invoices.length,
            creditNotes: creditNotes.length,
            vouchers: vouchers.length
        },
        customers,
        invoices,
        creditNotes,
        vouchers
    };

    const blob = await put(BLOB_KEY, JSON.stringify(snapshot), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0
    });

    return {
        ok: true,
        url: blob.url,
        generatedAt: snapshot.generatedAt,
        durationMs: snapshot.durationMs,
        counts: snapshot.counts
    };
}

async function read() {
    const meta = await head(BLOB_KEY);
    return {
        url: meta.url,
        uploadedAt: meta.uploadedAt,
        size: meta.size
    };
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action || 'read';

    try {
        if (action === 'refresh') {
            const secret = process.env.CRON_SECRET;
            if (secret) {
                const auth = req.headers.authorization || '';
                if (auth !== `Bearer ${secret}`) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            }
            const result = await refresh();
            return res.status(200).json(result);
        }

        if (action === 'read') {
            const result = await read();
            res.setHeader('Cache-Control', 'no-store');
            return res.status(200).json(result);
        }

        return res.status(400).json({ error: 'Invalid action. Use ?action=refresh|read' });
    } catch (error) {
        console.error(`Snapshot ${action} error:`, error);
        return res.status(500).json({ error: error.message });
    }
}
