/**
 * Utilidades para manejo estandarizado de fechas
 *
 * Este módulo proporciona funciones para normalizar fechas a UTC
 * y evitar problemas de zona horaria entre diferentes sistemas
 */

/**
 * Convierte una fecha a UTC antes de guardarla en MongoDB
 * Acepta: Date, string ISO, o string en formato YYYY-MM-DD
 * @param {Date|string} dateInput - Fecha a normalizar
 * @returns {Date} Fecha normalizada en UTC
 */
function normalizeToUTC(dateInput) {
  if (!dateInput) {
    return null;
  }

  let date;

  // Si es string, parsearlo
  if (typeof dateInput === 'string') {
    // Si es solo fecha (YYYY-MM-DD), agregar hora medianoche UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      date = new Date(dateInput + 'T00:00:00.000Z');
    } else {
      date = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    date = new Date(dateInput);
  } else {
    throw new Error('Invalid date input type');
  }

  // Validar que la fecha sea válida
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  // Retornar la fecha en UTC
  return date;
}

/**
 * Crea una fecha UTC desde componentes de fecha local
 * Útil cuando recibes año, mes, día, hora, minuto desde el frontend
 * @param {number} year
 * @param {number} month - 0-11 (0 = enero)
 * @param {number} day
 * @param {number} hour - 0-23
 * @param {number} minute - 0-59
 * @param {number} second - 0-59
 * @returns {Date} Fecha en UTC
 */
function createUTCDate(year, month, day, hour = 0, minute = 0, second = 0) {
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Obtiene el inicio del día en UTC para una fecha dada
 * @param {Date|string} dateInput
 * @returns {Date} Inicio del día en UTC
 */
function getStartOfDayUTC(dateInput) {
  const date = normalizeToUTC(dateInput);
  const startOfDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  return startOfDay;
}

/**
 * Obtiene el final del día en UTC para una fecha dada
 * @param {Date|string} dateInput
 * @returns {Date} Final del día en UTC
 */
function getEndOfDayUTC(dateInput) {
  const date = normalizeToUTC(dateInput);
  const endOfDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
  return endOfDay;
}

/**
 * Convierte una fecha ISO string a formato YYYY-MM-DD (solo fecha, sin hora)
 * Útil para inputs de tipo date
 * @param {Date|string} dateInput
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function toDateOnlyString(dateInput) {
  const date = normalizeToUTC(dateInput);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la fecha actual en UTC
 * @returns {Date} Fecha actual en UTC
 */
function nowUTC() {
  return new Date();
}

/**
 * Formatea una fecha para mostrar (DD/MM/YYYY o DD/MM/YYYY HH:mm)
 * @param {Date|string} dateInput
 * @param {boolean} includeTime - si true incluye hora
 * @returns {string}
 */
function formatForDisplay(dateInput, includeTime = false) {
  const date = normalizeToUTC(dateInput);
  if (!date) return '';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  if (includeTime) {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  return `${day}/${month}/${year}`;
}

module.exports = {
  normalizeToUTC,
  createUTCDate,
  getStartOfDayUTC,
  getEndOfDayUTC,
  toDateOnlyString,
  nowUTC,
  formatForDisplay,
};
