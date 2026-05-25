// Vercel Serverless Function - Proxy para Siigo API
// Maneja autenticación y todas las llamadas a Siigo

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { endpoint, page, page_size, ...extraParams } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint requerido' });
    }

    // Credenciales viven solo en el server (env vars Vercel)
    const username = process.env.SIIGO_USERNAME;
    const accessKey = process.env.SIIGO_ACCESS_KEY;

    try {
        let token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            if (!username || !accessKey) {
                return res.status(500).json({ error: 'Credenciales Siigo no configuradas en el servidor' });
            }

            // Autenticación con Siigo
            const authResponse = await fetch('https://api.siigo.com/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, access_key: accessKey })
            });

            if (!authResponse.ok) {
                const error = await authResponse.text();
                return res.status(authResponse.status).json({
                    error: 'Error de autenticación con Siigo',
                    details: error
                });
            }

            const authData = await authResponse.json();
            token = authData.access_token;

            // Retornar token si solo se pidió autenticación
            if (endpoint === 'auth') {
                return res.status(200).json(authData);
            }
        }

        // Construir URL de Siigo con parámetros de paginación y filtros adicionales
        let siigoUrl = `https://api.siigo.com/v1/${endpoint}`;
        const queryParams = [];
        if (page) queryParams.push(`page=${page}`);
        if (page_size) queryParams.push(`page_size=${page_size}`);
        // Pasar filtros adicionales a Siigo (date_start, date_end, etc.)
        for (const [key, value] of Object.entries(extraParams)) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
        if (queryParams.length > 0) {
            siigoUrl += `?${queryParams.join('&')}`;
        }

        // Hacer request a Siigo
        const siigoResponse = await fetch(siigoUrl, {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Partner-Id': 'Empresa'
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await siigoResponse.json();

        return res.status(siigoResponse.status).json(data);

    } catch (error) {
        console.error('Error en proxy Siigo:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
}
