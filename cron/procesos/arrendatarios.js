// cron/procesos/arrendatarios.js
const { logger } = require('../../libs/logger');

// helper: fetch con timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: ac.signal });
        return res;
    } finally {
        clearTimeout(t);
    }
}

module.exports = {
    name: 'arrendatarios-actualizar-direccion',
    run: async () => {
        const TARGET_EMAIL = 'jjviera@vitalmoveglobal.com';
        const NEW_DIRECCION = 'croncambiado a las 10 automatico';

        // 1) Obtener usuarios
        const listUrl = 'https://api.vitalmoveglobal.com/vm-users-cd/obtener-todos-usuarios-piscina/6877f7f9c1f4bd360cce0496';
        logger.info('[arrendatarios] solicitando listado…', { listUrl });

        const res = await fetchWithTimeout(listUrl, { method: 'GET' });
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`GET usuarios fallo: ${res.status} ${res.statusText} ${txt}`);
        }

        const data = await res.json();
        const users = Array.isArray(data?.users) ? data.users : [];
        logger.info('[arrendatarios] usuarios recibidos', { count: users.length });

        // 2) Buscar por email (case-insensitive, trim)
        const target = users.find(u => (u?.email || '').toLowerCase().trim() === TARGET_EMAIL);
        if (!target?._id) {
            logger.warn('[arrendatarios] usuario no encontrado por email', { email: TARGET_EMAIL });
            return; // no cortar toda la corrida si no está
        }

        const id = target._id;
        logger.info('[arrendatarios] usuario encontrado', { id, email: target.email });

        // 3) PUT a API local para actualizar direccion
        const putUrl = `http://localhost:4000/vm-users-cd/actualizar-usuario-piscina/${id}`;
        const body = { direccion: NEW_DIRECCION };

        const putRes = await fetchWithTimeout(putUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!putRes.ok) {
            const txt = await putRes.text().catch(() => '');
            throw new Error(`PUT actualizar fallo: ${putRes.status} ${putRes.statusText} ${txt}`);
        }

        const updated = await putRes.json().catch(() => ({}));
        logger.info('[arrendatarios] direccion actualizada OK', { id, direccion: NEW_DIRECCION, apiResp: updated?.message || 'ok' });
    },
};
