// Vercel Serverless Function - Autenticación
// Sistema de login con JWT para Lexia Facturación

// Usuarios con contraseñas hasheadas (SHA-256 con salt)
// Salt: "lexia2024" + contraseña -> SHA-256
const USERS = {
    'carolina': {
        name: 'Carolina',
        passwordHash: 'd1b20dca5566dfbbfa066e51ff1de8266c47f35806d03c591b2942349077fad0'
    },
    'sare': {
        name: 'Sare',
        passwordHash: '2290698eda30b7d4d29940fb55bf5df3360260e3bb761eddbd2238b2cd97cb22'
    },
    'josetorresvarela': {
        name: 'Jose Torres Varela',
        passwordHash: '8d5b70631a770b2715271a3dcddedbd39724e6799d3bd3931bb6f6fb6d0ba7a4'
    },
    'jose.torresf': {
        name: 'Jose Torres F',
        passwordHash: '4009b2829d9c1f9f3214c5a5a07f3731e5b13cc17dc73a7e5729349326ed7d8c'
    },
    'felipe.torres': {
        name: 'Felipe Torres',
        passwordHash: 'aafff17840226152e75db5ff3341d6b0c9f83eadbdc6eb186287df8a9ac86858'
    }
};

const SALT = 'lexia2024';
const JWT_SECRET = process.env.JWT_SECRET || 'lexia-facturacion-secret-key-2024';
const TOKEN_EXPIRY = 8 * 60 * 60 * 1000; // 8 horas en ms

// Función para hashear con SHA-256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Función para crear un JWT simple
async function createToken(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Date.now();
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + TOKEN_EXPIRY
    };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(tokenPayload));
    const dataToSign = `${base64Header}.${base64Payload}`;

    // Firmar con HMAC-SHA256
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataToSign));
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${base64Header}.${base64Payload}.${base64Signature}`;
}

// Función para verificar un JWT
async function verifyToken(token) {
    try {
        const [header, payload, signature] = token.split('.');
        if (!header || !payload || !signature) return null;

        const dataToVerify = `${header}.${payload}`;

        // Verificar firma
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(JWT_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            new TextEncoder().encode(dataToVerify)
        );

        if (!isValid) return null;

        // Decodificar payload
        const decodedPayload = JSON.parse(atob(payload));

        // Verificar expiración
        if (decodedPayload.exp < Date.now()) return null;

        return decodedPayload;
    } catch (e) {
        return null;
    }
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    // Acción: Login
    if (action === 'login' && req.method === 'POST') {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Usuario y contraseña son requeridos'
                });
            }

            const userKey = username.toLowerCase().trim();
            const user = USERS[userKey];

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario o contraseña incorrectos'
                });
            }

            // Hashear la contraseña ingresada
            const inputHash = await sha256(SALT + password);

            if (inputHash !== user.passwordHash) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario o contraseña incorrectos'
                });
            }

            // Crear token JWT
            const token = await createToken({
                username: userKey,
                name: user.name
            });

            // Log de acceso exitoso
            const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
            console.log(`[LOGIN OK] Usuario: ${user.name}, IP: ${clientIP}, Fecha: ${new Date().toISOString()}`);

            return res.status(200).json({
                success: true,
                token,
                user: {
                    username: userKey,
                    name: user.name
                },
                expiresIn: TOKEN_EXPIRY
            });

        } catch (error) {
            console.error('Error en login:', error);
            return res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    // Acción: Verificar token
    if (action === 'verify') {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                username: payload.username,
                name: payload.name
            },
            expiresAt: payload.exp
        });
    }

    return res.status(400).json({ error: 'Acción no válida' });
}

// Exportar función de verificación para usar en otros endpoints
export { verifyToken };
