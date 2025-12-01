const mongoose = require('mongoose');

const espaciosDeportivosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    direccion: { type: String, },
    telefono: { type: String },
    email: { type: String },
    rut: { type: String, },
    ciudad: { type: String,},
    comuna: { type: String, },
    region: { type: String, },
    complejoDeportivo: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto' },
    status: { type: Boolean, default: true },
}, {
    timestamps: true
});

const EspaciosDeportivosPteAlto = mongoose.model('espaciosDeportivosPteAlto', espaciosDeportivosPteAltoSchema);

module.exports = EspaciosDeportivosPteAlto;