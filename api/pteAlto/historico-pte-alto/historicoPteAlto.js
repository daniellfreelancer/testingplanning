const mongoose = require('mongoose');

const historicoPteAltoSchema = new mongoose.Schema({
    realizadoPor: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto', required: true },
    accion: { type: String, required: true },
    descripcion: { type: String, required: true },
}, {
    timestamps: true
});

const HistoricoPteAlto = mongoose.model('historicoPteAlto', historicoPteAltoSchema);

module.exports = HistoricoPteAlto;
