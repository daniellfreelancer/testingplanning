const mongoose = require('mongoose');

const eventosVariantesPteAltoSchema = new mongoose.Schema({
    evento: { type: mongoose.Types.ObjectId, ref: 'eventosPteAlto' },
    capacidad: { type: Number, required: false },
    nombre: { type: String, required: false },
    esPago: { type: Boolean, default: false },
    valor:{type: Number, required: false},
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    edadMinima: { type: Number, required: false },
    edadMaxima: { type: Number, required: false },
    sexo: { type: String, enum: ['masculino', 'femenino', 'ambos'], required: false },
    sinEdad: { type: Boolean, default: false },
}, {
    timestamps: true
});

const EventosVariantesPteAlto = mongoose.model('eventosVariantesPteAlto', eventosVariantesPteAltoSchema);

module.exports = EventosVariantesPteAlto;