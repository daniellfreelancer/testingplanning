const mongoose = require('mongoose');

const suscripcionPlanesSchema = new mongoose.Schema({
    usuario: { type: mongoose.Types.ObjectId, ref: 'usuariosComplejos', required: true },
    planId: { type: mongoose.Types.ObjectId, ref: 'gestionPlanesN', required: true },
    varianteId: { type: mongoose.Types.ObjectId, ref: 'variantesPlanes', required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, },
    pago: { type: mongoose.Types.ObjectId, ref: 'gestionPagos', required: true },
    status: { type: Boolean, default: true },
    tipoConsumo: { type: String, required: true, enum: ['horas', 'mensual', 'bloques'] },
    horasDisponibles : {type: Number},
    bloquesDisponibles : {type: Number},
});

const SuscripcionPlanes = mongoose.model('suscripcionPlanes', suscripcionPlanesSchema);

module.exports = SuscripcionPlanes;