// Endpoint read-only del snapshot Lexia.
// El refresh corre en GitHub Actions (scripts/refresh-snapshot.js, 1x/dia).
// Este endpoint solo descubre la URL publica del blob para el frontend.

import { head } from '@vercel/blob';

const BLOB_KEY = 'lexia/snapshot.json';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const meta = await head(BLOB_KEY);
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
            url: meta.url,
            uploadedAt: meta.uploadedAt,
            size: meta.size
        });
    } catch (error) {
        console.error('Snapshot read error:', error);
        return res.status(404).json({ error: 'Snapshot no disponible' });
    }
}
