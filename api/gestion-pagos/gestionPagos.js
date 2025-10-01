const mongoose = require('mongoose');

const gestionPagosSchema = new mongoose.Schema({
    usuario: { type: mongoose.Types.ObjectId, ref: 'usuariosComplejos', required: true },
    institucion: { type: mongoose.Types.ObjectId, ref: 'institucion', required: true },
    transaccion: { type: String, required: true },
    voucher: { type: String },
    monto: { type: Number, required: true },
    fechaPago: { type: Date, required: true },
    recepcion: { type: mongoose.Types.ObjectId, ref: 'usuariosComplejos', required: true },
    plan: { type: mongoose.Types.ObjectId, ref: 'gestionPlanesN', required: true },
    planCurso: { type: mongoose.Types.ObjectId, ref: 'gestionPlanes', },
    planNL: { type: mongoose.Types.ObjectId, ref: 'gestionPlanes' },
    planGym: { type: mongoose.Types.ObjectId, ref: 'gestionPlanes' },
},
{
    timestamps: true
})

const GestionPagos = mongoose.model('gestionPagos', gestionPagosSchema);

module.exports = GestionPagos;