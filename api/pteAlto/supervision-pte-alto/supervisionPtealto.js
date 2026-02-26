const mongoose = require('mongoose');

const supervisionPteAltoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto', required: true },
    fecha: { type: Date, },
    observaciones: { type: String },
    supervisionComplejos: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto', required: true },
    supervisionEspacio: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto', required: true },
    supervisionSede: { type: mongoose.Types.ObjectId, ref: 'sedesDeportivasPteAlto', required: true },
    supervisionTaller: { type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto', required: true },

});

const SupervisionPteAlto = mongoose.model('supervisionPteAlto', supervisionPteAltoSchema);

module.exports = SupervisionPteAlto;