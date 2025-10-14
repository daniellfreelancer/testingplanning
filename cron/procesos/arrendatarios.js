// cron/procesos/arrendatarios.js
const { logger } = require('../../libs/logger');

// - DIRECTO = '' para procesar a TODOS los que tengan nombreArrendatario con algo.
// - DIRECTO = 'Hola' (por ejemplo) para que SOLO procese a quienes tengan nombreArrendatario === 'Hola' (case-insensitive).
const CONFIG = {
  DIRECTO: 'club LBQBLO', 
};

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

const TZ = 'America/Santiago';

function currentMonthInTZ(timeZone = TZ) {
  const now = new Date();
  const mStr = now.toLocaleString('es-CL', { month: 'numeric', timeZone });
  return parseInt(mStr, 10);
}

function monthInTZ(dateLike, timeZone = TZ) {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  const monthStr = d.toLocaleString('es-CL', { month: 'numeric', timeZone });
  const num = parseInt(monthStr, 10);
  return Number.isFinite(num) ? num : null;
}

module.exports = {
  name: 'arrendatarios-mes-check',
  run: async () => {
    const listUrl =
      'https://api.vitalmoveglobal.com/vm-users-cd/obtener-todos-usuarios-piscina/6877f7f9c1f4bd360cce0496';

    logger.info('[arrendatarios] solicitando listado…', {
      listUrl,
      directo: CONFIG.DIRECTO || '(todos)',
      tz: TZ,
    });

    // 1) GET usuarios
    const res = await fetchWithTimeout(listUrl, { method: 'GET' });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`GET usuarios fallo: ${res.status} ${res.statusText} ${txt}`);
    }

    const data = await res.json();
    const allUsers = Array.isArray(data?.users) ? data.users : [];
    logger.info('[arrendatarios] usuarios recibidos', { count: allUsers.length });

    // que tengan nombreArrendatario con algo
    let filtered = allUsers.filter((u) => {
      const val = (u?.nombreArrendatario ?? '').toString().trim();
      return val.length > 0;
    });

    // para testear, filtrar por nombreArrendatario exacto (case-insensitive)
    const DIRECTO = (CONFIG.DIRECTO || '').trim();
    if (DIRECTO) {
      const target = DIRECTO.toLowerCase();
      filtered = filtered.filter(
        (u) => (u?.nombreArrendatario ?? '').toString().trim().toLowerCase() === target
      );
    }

    logger.info('[arrendatarios] candidatos con nombreArrendatario', {
      candidates: filtered.length,
    });

    if (filtered.length === 0) {
      logger.warn('[arrendatarios] no hay usuarios que cumplan filtros', {
        directo: DIRECTO || '(todos)',
      });
      return;
    }

    // evaluar mes de fechaInicioArrendatario vs mes actual
    const mesActual = currentMonthInTZ(TZ);
    const toUpdate = [];
    let coincide = 0;
    let invalida = 0;

    for (const u of filtered) {
      const id = u?._id;
      const nombreArrendatario = (u?.nombreArrendatario ?? '').toString().trim();
      const fechaInicio = u?.fechaInicioArrendatario; // p.ej. "2025-09-01T19:29:56.102+00:00"
      const mesInicio = monthInTZ(fechaInicio, TZ);

      if (!mesInicio) {
        invalida++;
        logger.warn('[arrendatarios] usuario sin fechaInicioArrendatario válida, se omite', {
          id,
          email: u?.email,
          nombreArrendatario,
          fechaInicioArrendatario: fechaInicio || null,
        });
        continue;
      }

      if (mesInicio === mesActual) {
        coincide++;
        logger.info('[arrendatarios] sin cambios (mes coincide)', {
          id,
          email: u?.email,
          nombreArrendatario,
          mesInicio,
          mesActual,
        });
        continue;
      }

      // Diferente al mes actual -> actualizar statusArrendatario=false
      toUpdate.push({
        id,
        email: u?.email,
        nombreArrendatario,
        fechaInicioArrendatario: fechaInicio,
        mesInicio,
        mesActual,
      });
    }

    logger.info('[arrendatarios] resumen pre-actualización', {
      paraActualizar: toUpdate.length,
      mesCoincide: coincide,
      fechaInvalida: invalida,
    });

    if (toUpdate.length === 0) return;

    // PUT por cada usuario pendiente
    for (const it of toUpdate) {
      const putUrl = `https://api.vitalmoveglobal.com/vm-users-cd/actualizar-usuario-piscina/${it.id}`;
      const body = { statusArrendatario: false };

      try {
        const putRes = await fetchWithTimeout(putUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!putRes.ok) {
          const txt = await putRes.text().catch(() => '');
          throw new Error(`PUT fallo: ${putRes.status} ${putRes.statusText} ${txt}`);
        }

        const updated = await putRes.json().catch(() => ({}));
        logger.info('[arrendatarios] statusArrendatario actualizado a false', {
          id: it.id,
          email: it.email,
          nombreArrendatario: it.nombreArrendatario,
          fechaInicioArrendatario: it.fechaInicioArrendatario,
          mesInicio: it.mesInicio,
          mesActual: it.mesActual,
          apiResp: updated?.message || 'ok',
        });
      } catch (err) {
        logger.error('[arrendatarios] error al actualizar usuario', {
          id: it.id,
          email: it.email,
          error: err?.message || String(err),
        });
      }
    }
  },
};
