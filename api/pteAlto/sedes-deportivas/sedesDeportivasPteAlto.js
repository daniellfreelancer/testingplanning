const mongoose = require('mongoose');

const sedesDeportivasPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    imgUrl: { type: String },
    direccion: { type: String },
    ciudad: { type: String },
    comuna: { type: String },
    region: { type: String },
    talleres: [{ type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto' }],
    eventos: [{ type: mongoose.Types.ObjectId, ref: 'eventosPteAlto' }],
    status: { type: String, enum: ['activo', 'interno', 'mantencion', 'desactivado'], default: 'activo' },
    dias: { type: Array },
    horarioApertura: { type: String },
    horarioCierre: { type: String },
    supervision: [{ type: mongoose.Types.ObjectId, ref: 'supervisionPteAlto' }],
},
{
    timestamps: true
});

const SedesDeportivasPteAlto = mongoose.model('sedesDeportivasPteAlto', sedesDeportivasPteAltoSchema);

module.exports = SedesDeportivasPteAlto;