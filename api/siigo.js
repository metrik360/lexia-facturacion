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

    const { endpoint, username, access_key } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint requerido' });
    }

    try {
        // Si se proporcionan credenciales, obtener token
        let token = req.headers.authorization?.replace('Bearer ', '');

        if (username && access_key && !token) {
            // Autenticación con Siigo
            const authResponse = await fetch('https://api.siigo.com/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, access_key })
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

        if (!token) {
            return res.status(401).json({ error: 'Token de autorización requerido' });
        }

        // Construir URL de Siigo
        const siigoUrl = `https://api.siigo.com/v1/${endpoint}`;

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
