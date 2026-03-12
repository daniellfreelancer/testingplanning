const mongoose = require('mongoose');

const gruposPiscinaStgoSchema = new mongoose.Schema({
        mes: { type: String, required: true },
        año: { type: String, required: true },
        variantesId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'variantesPlanes' }],
        planId: { type: mongoose.Schema.Types.ObjectId, ref: 'gestionPlanesN'},
        nivel: { type: String, required: true },
        profesor: { type: mongoose.Schema.Types.ObjectId, ref: 'profesoresPiscinaStgo' },
        usuarios: [{ type: Object }],
        status: { type: Boolean, default: true },
        capacidad: { type: Number, required: true },
        asistencia: [{ type: Object }],
},{
    timestamps: true
});

const GruposPiscinaStgo = mongoose.model('gruposPiscinaStgo', gruposPiscinaStgoSchema);

module.exports = GruposPiscinaStgo;