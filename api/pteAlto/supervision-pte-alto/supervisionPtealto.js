const mongoose = require('mongoose');

const supervisionPteAltoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto', required: true },
    fecha: { type: Date },
    observaciones: { type: String },
    tipo: { type: String },
    supervisionComplejos: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto', default: null },
    supervisionEspacio: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto', default: null },
    supervisionSede: { type: mongoose.Types.ObjectId, ref: 'sedesDeportivasPteAlto', default: null },
    supervisionTaller: { type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto', default: null },

});

const SupervisionPteAlto = mongoose.model('supervisionPteAlto', supervisionPteAltoSchema);

module.exports = SupervisionPteAlto;