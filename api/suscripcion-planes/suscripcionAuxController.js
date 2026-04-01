const SuscripcionPlanes = require("./suscripcionPlanes");
const {
    buildMarzo2026SuscripcionFilter,
    buildPostMigracionAbril2026Filter,
    FECHA_INICIO_MIGRACION_UTC,
    normalizeDuracion,
    fechaFinForDuracionNormalized,
} = require("./suscripcionMarzo2026Migration");

const planIdPopulate = { path: "planId", select: "valor tipo nombrePlan duracion" };

/**
 * Requiere variable de entorno SUSCRIPCION_MIGRATE_ABRIL_2026_SECRET y cabecera
 * x-suscripcion-migrate-secret con el mismo valor.
 */
function assertMigrationAuthorized(req, res) {
    const secret = process.env.SUSCRIPCION_MIGRATE_ABRIL_2026_SECRET;
    if (!secret) {
        res.status(503).json({
            message: "Migración no disponible: definir SUSCRIPCION_MIGRATE_ABRIL_2026_SECRET en el entorno.",
            success: false,
        });
        return false;
    }
    const sent = req.get("x-suscripcion-migrate-secret");
    if (sent !== secret) {
        res.status(403).json({
            message: "No autorizado.",
            success: false,
        });
        return false;
    }
    return true;
}

const suscripcionAuxController = {
    getSuscripcionesFechaInicioMarzo2026: async (req, res) => {
        try {
            const { filter } = await buildMarzo2026SuscripcionFilter();

            const suscripciones = await SuscripcionPlanes.find(filter).populate(planIdPopulate);

            res.status(200).json({
                message: "Suscripciones obtenidas correctamente",
                cantidadSuscripciones: suscripciones.length,
                suscripciones,
                success: true,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener las suscripciones por fecha de inicio",
                error: error.message,
            });
        }
    },

    /**
     * Listado de suscripciones que coinciden con el resultado de la migración abril 2026:
     * fechaInicio 1 abr 2026 UTC, fechaFin según mes/trimestre/semestre, excluye Pase Diario.
     */
    getSuscripcionesMigradasAbril2026: async (req, res) => {
        try {
            const { filter } = await buildPostMigracionAbril2026Filter();
            const suscripciones = await SuscripcionPlanes.find(filter).populate(planIdPopulate);

            res.status(200).json({
                message: "Suscripciones migradas (abr 2026) obtenidas correctamente",
                cantidadSuscripciones: suscripciones.length,
                suscripciones,
                success: true,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al obtener suscripciones migradas abril 2026",
                error: error.message,
            });
        }
    },

    /**
     * Simulación: mismos documentos que GET /fecha-inicio-marzo-2026; sin escritura.
     * cantidadSuscripciones debe coincidir con ese GET (misma query base).
     */
    dryRunMigracionFechasAbril2026: async (req, res) => {
        try {
          //  if (!assertMigrationAuthorized(req, res)) return;

            const { filter } = await buildMarzo2026SuscripcionFilter();
            const cantidadSuscripciones = await SuscripcionPlanes.countDocuments(filter);

            const suscripciones = await SuscripcionPlanes.find(filter).populate(planIdPopulate).lean();

            const desglosePorDuracion = { mes: 0, trimestre: 0, semestre: 0 };
            const omitidos = [];

            for (const s of suscripciones) {
                const raw = s.planId && s.planId.duracion;
                const norm = normalizeDuracion(raw);
                const fin = fechaFinForDuracionNormalized(norm);
                if (fin) {
                    if (desglosePorDuracion[norm] !== undefined) {
                        desglosePorDuracion[norm] += 1;
                    }
                } else {
                    omitidos.push({
                        suscripcionId: String(s._id),
                        duracion: raw ?? null,
                    });
                }
            }

            res.status(200).json({
                message: "Dry-run: sin cambios persistidos. Validar que cantidadSuscripciones coincide con GET /fecha-inicio-marzo-2026.",
                success: true,
                cantidadSuscripciones,
                desglosePorDuracion,
                cantidadOmitidosPorDuracionDesconocida: omitidos.length,
                muestraOmitidos: omitidos.slice(0, 50),
            });
        } catch (error) {
            res.status(500).json({
                message: "Error en dry-run de migración",
                error: error.message,
            });
        }
    },

    /**
     * Ejecuta actualización: fechaInicio 2026-04-01 UTC; fechaFin según duracion (mes/trimestre/semestre).
     * Body: { "confirm": true }
     */
    ejecutarMigracionFechasAbril2026: async (req, res) => {
        try {
           // if (!assertMigrationAuthorized(req, res)) return;

            if (!req.body || req.body.confirm !== true) {
                res.status(400).json({
                    message: 'Se requiere JSON body { "confirm": true } para ejecutar la migración.',
                    success: false,
                });
                return;
            }

            const { filter } = await buildMarzo2026SuscripcionFilter();
            const suscripciones = await SuscripcionPlanes.find(filter).populate(planIdPopulate);

            const omitidos = [];
            const ops = [];

            for (const s of suscripciones) {
                const raw = s.planId && s.planId.duracion;
                const norm = normalizeDuracion(raw);
                const fechaFin = fechaFinForDuracionNormalized(norm);

                if (!fechaFin) {
                    omitidos.push({
                        suscripcionId: String(s._id),
                        duracion: raw ?? null,
                    });
                    continue;
                }

                ops.push({
                    updateOne: {
                        filter: { _id: s._id },
                        update: {
                            $set: {
                                fechaInicio: FECHA_INICIO_MIGRACION_UTC,
                                fechaFin,
                            },
                        },
                    },
                });
            }

            let bulkResult = null;
            if (ops.length > 0) {
                bulkResult = await SuscripcionPlanes.bulkWrite(ops, { ordered: false });
            }

            res.status(200).json({
                message: "Migración ejecutada",
                success: true,
                cantidadEncontradas: suscripciones.length,
                cantidadActualizadas: ops.length,
                cantidadOmitidas: omitidos.length,
                muestraOmitidos: omitidos.slice(0, 50),
                bulkResult,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error al ejecutar migración de fechas",
                error: error.message,
            });
        }
    },
};

module.exports = suscripcionAuxController;
