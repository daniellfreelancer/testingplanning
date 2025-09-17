const mongoose = require('mongoose');

const gestionPlanesSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    tipoPlan: { type: String, required: true },
    plan: { type: String, required: true },
    dias: { type: Array, required: true },
    horarios: { type: Array, required: true },
    valor: { type: Number, required: true },
    institucion: { type: mongoose.Types.ObjectId, ref: 'institucion', required: true },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
    status: { type: Boolean, default: true },
},{
    timestamps: true
})

const GestionPlanes = mongoose.model('gestionPlanes', gestionPlanesSchema);

module.exports = GestionPlanes