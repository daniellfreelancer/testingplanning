const mongoose = require('mongoose');

const variantesPlanesSchema = new mongoose.Schema({
    planId:  { type: mongoose.Types.ObjectId, ref: 'gestionPlanesN', required: true },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
    dia: { type: String },
    horario: { type: String },
},{
    timestamps: true
});

const VariantesPlanes = mongoose.model('variantesPlanes', variantesPlanesSchema);

module.exports = VariantesPlanes;