// Snapshot Siigo standalone - se ejecuta desde GitHub Actions (cron 1x/dia)
// Hace pull completo de Siigo y sube el JSON directo a Vercel Blob.
//
// Env vars requeridas:
//   SIIGO_USERNAME
//   SIIGO_ACCESS_KEY
//   BLOB_READ_WRITE_TOKEN   (token de Vercel Blob, mismo que usa el endpoint api/snapshot)

import { put } from '@vercel/blob';

const BLOB_KEY = 'lexia/snapshot.json';

async function autenticarSiigo() {
    const username = process.env.SIIGO_USERNAME;
    const accessKey = process.env.SIIGO_ACCESS_KEY;
    if (!username || !accessKey) {
        throw new Error('Faltan SIIGO_USERNAME o SIIGO_ACCESS_KEY');
    }
    const r = await fetch('https://api.siigo.com/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, access_key: accessKey })
    });
    if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Siigo auth failed: ${r.status} ${txt.slice(0, 300)}`);
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
            throw new Error(`Siigo ${endpoint} p${page} failed: ${r.status} ${txt.slice(0, 300)}`);
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

    console.log(`  ${endpoint}: ${all.length} registros`);
    return all;
}

async function main() {
    const startedAt = Date.now();
    console.log('Autenticando con Siigo...');
    const token = await autenticarSiigo();
    const dateStart = (new Date().getFullYear() - 5) + '-01-01';

    console.log(`Descargando data desde ${dateStart}...`);
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

    const payload = JSON.stringify(snapshot);
    console.log(`Snapshot listo: ${(payload.length / 1024 / 1024).toFixed(2)} MB. Subiendo a Blob...`);

    const blob = await put(BLOB_KEY, payload, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0
    });

    console.log(`OK. Blob URL: ${blob.url}`);
    console.log(`Total: ${snapshot.durationMs}ms`);
    console.log(JSON.stringify({ ok: true, generatedAt: snapshot.generatedAt, counts: snapshot.counts }, null, 2));
}

main().catch((err) => {
    console.error('Snapshot refresh fallo:', err.message);
    console.error(err.stack);
    process.exit(1);
});
