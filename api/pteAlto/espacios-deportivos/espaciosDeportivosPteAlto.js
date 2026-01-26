const mongoose = require('mongoose');

const espaciosDeportivosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    direccion: { type: String, },
    ciudad: { type: String,},
    comuna: { type: String, },
    region: { type: String, },
    complejoDeportivo: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto' },
    talleres: [{ type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto' }],
    status: { type: String, enum: ['activo', 'interno', 'mantencion', 'desactivado'], default: 'desactivado' },
    dias: { type: Array },
    horarioApertura: { type: String },
    horarioCierre: { type: String },
    valor: { type: Number },
    pago: { type: Boolean },
    deporte: { type: String },
    imgUrl: { type: String },
    capacidad: { type: Number },
    tiempoReserva: { type: Number },
}, {
    timestamps: true
});

const EspaciosDeportivosPteAlto = mongoose.model('espaciosDeportivosPteAlto', espaciosDeportivosPteAltoSchema);

module.exports = EspaciosDeportivosPteAlto;