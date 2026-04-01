const GestionPlanesN = require("../gestion-planes/gestionPlanesN");

/**
 * Rango de fechaInicio usado por getSuscripcionesFechaInicioMarzo2026 y la migración:
 * [2026-03-15 00:00 UTC, 2026-04-01 00:00 UTC) — equivale al 15–31 de marzo 2026 en calendario UTC.
 */
function getMarzo2026FechaInicioRangoUTC() {
    return {
        desde: new Date(Date.UTC(2026, 2, 15, 0, 0, 0, 0)),
        hastaExclusivo: new Date(Date.UTC(2026, 3, 1, 0, 0, 0, 0)),
    };
}

async function getPlanIdsExcluirPaseDiario() {
    const planes = await GestionPlanesN.find({ nombrePlan: "Pase Diario" }).select("_id").lean();
    return planes.map((p) => p._id);
}

/**
 * Mismo criterio que el listado: rango de marzo 2026 y exclusión de plan "Pase Diario".
 */
async function buildMarzo2026SuscripcionFilter() {
    const { desde, hastaExclusivo } = getMarzo2026FechaInicioRangoUTC();
    const planIdsExcluir = await getPlanIdsExcluirPaseDiario();
    return {
        filter: {
            fechaInicio: { $gte: desde, $lt: hastaExclusivo },
            planId: { $nin: planIdsExcluir },
        },
        desde,
        hastaExclusivo,
        planIdsExcluir,
    };
}

/**
 * Nueva fechaInicio unificada: 1 abr 2026, medianoche UTC.
 * Las fechas "solo día" se almacenan como en el resto de este módulo (UTC).
 */
const FECHA_INICIO_MIGRACION_UTC = new Date(Date.UTC(2026, 3, 1, 0, 0, 0, 0));

/** Claves tras normalizeDuracion; valores = último día del periodo en UTC */
const FECHA_FIN_BY_DURACION_NORMALIZADA = {
    mes: new Date(Date.UTC(2026, 3, 30, 0, 0, 0, 0)),
    trimestre: new Date(Date.UTC(2026, 5, 30, 0, 0, 0, 0)),
    semestre: new Date(Date.UTC(2026, 8, 30, 0, 0, 0, 0)),
};

function normalizeDuracion(duracion) {
    if (duracion == null || typeof duracion !== "string") return null;
    const n = duracion.trim().toLowerCase();
    return n || null;
}

function fechaFinForDuracionNormalized(normalized) {
    if (!normalized) return null;
    return FECHA_FIN_BY_DURACION_NORMALIZADA[normalized] ?? null;
}

/** Fechas de fin que asigna la migración (mes / trimestre / semestre). */
const FECHAS_FIN_MIGRACION_ABRIL_2026 = Object.values(FECHA_FIN_BY_DURACION_NORMALIZADA);

/**
 * Suscripciones en estado resultante de ejecutar la migración abril 2026:
 * fechaInicio unificada, fechaFin en el conjunto esperado, sin plan Pase Diario.
 */
async function buildPostMigracionAbril2026Filter() {
    const planIdsExcluir = await getPlanIdsExcluirPaseDiario();
    return {
        filter: {
            fechaInicio: FECHA_INICIO_MIGRACION_UTC,
            fechaFin: { $in: FECHAS_FIN_MIGRACION_ABRIL_2026 },
            planId: { $nin: planIdsExcluir },
        },
        planIdsExcluir,
    };
}

module.exports = {
    getMarzo2026FechaInicioRangoUTC,
    getPlanIdsExcluirPaseDiario,
    buildMarzo2026SuscripcionFilter,
    FECHA_INICIO_MIGRACION_UTC,
    FECHA_FIN_BY_DURACION_NORMALIZADA,
    normalizeDuracion,
    fechaFinForDuracionNormalized,
    FECHAS_FIN_MIGRACION_ABRIL_2026,
    buildPostMigracionAbril2026Filter,
};
