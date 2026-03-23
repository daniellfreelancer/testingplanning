/**
 * Store en memoria para códigos de validación de email (registro usuarios Puente Alto).
 * Usa Map con TTL de 5 minutos. Limpieza periódica de entradas expiradas.
 * Solo para el flujo de registro de usuarios externos Puente Alto.
 */

const TTL_MS = 5 * 60 * 1000; // 5 minutos
const COOLDOWN_MS = 60 * 1000; // 60 segundos entre envíos
const CLEANUP_INTERVAL_MS = 60 * 1000; // limpiar cada minuto

/** Map: email (normalizado) -> { codigo, expiresAt, lastSentAt } */
const store = new Map();

function normalizarEmail(email) {
  return (email || "").trim().toLowerCase();
}

function generarCodigo6Digitos() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Guarda un código para el email. Retorna el código generado.
 */
function guardar(email, codigo) {
  const key = normalizarEmail(email);
  const now = Date.now();
  store.set(key, {
    codigo,
    expiresAt: now + TTL_MS,
    lastSentAt: now,
  });
  return codigo;
}

/**
 * Verifica si el código es correcto y no ha expirado.
 * Si es válido, elimina el código del store (uso único).
 */
function verificar(email, codigo) {
  const key = normalizarEmail(email);
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  const match = entry.codigo === String(codigo).trim();
  if (match) store.delete(key);
  return match;
}

/**
 * Comprueba si puede enviar (cooldown de 60s).
 * Retorna { puede: boolean, segundosRestantes?: number }
 */
function puedeEnviar(email) {
  const key = normalizarEmail(email);
  const entry = store.get(key);
  if (!entry) return { puede: true };
  const elapsed = Date.now() - entry.lastSentAt;
  if (elapsed >= COOLDOWN_MS) return { puede: true };
  return {
    puede: false,
    segundosRestantes: Math.ceil((COOLDOWN_MS - elapsed) / 1000),
  };
}

/**
 * Genera y guarda un código para el email. Actualiza lastSentAt.
 */
function generarYGuardar(email) {
  const codigo = generarCodigo6Digitos();
  const key = normalizarEmail(email);
  const now = Date.now();
  store.set(key, {
    codigo,
    expiresAt: now + TTL_MS,
    lastSentAt: now,
  });
  return codigo;
}

function limpiarExpirados() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

setInterval(limpiarExpirados, CLEANUP_INTERVAL_MS);

module.exports = {
  guardar,
  verificar,
  puedeEnviar,
  generarYGuardar,
};
