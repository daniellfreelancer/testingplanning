const mongoose = require('mongoose');

const talleresDeportivosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    galeria: [{ type: String }],
    video: { type: String },
    link: { type: String },
    espacioDeportivo: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' },
    capacidad: { type: Number },
    valor: { type: Number },
    pago: { type: Boolean },
    horarios: { type: Array },
    dia: { type: Array },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    status: { type: Boolean, default: true },

}, {
    timestamps: true
});

const TalleresDeportivosPteAlto = mongoose.model('talleresDeportivosPteAlto', talleresDeportivosPteAltoSchema);

module.exports = TalleresDeportivosPteAlto;