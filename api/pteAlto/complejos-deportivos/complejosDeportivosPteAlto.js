const mongoose = require('mongoose');

const complejosDeportivosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    direccion: { type: String, },
    telefono: { type: String },
    email: { type: String },
    rut: { type: String, },
    ciudad: { type: String,},
    comuna: { type: String, },
    region: { type: String, },
    institucion: { type: mongoose.Types.ObjectId, ref: 'institucion' },
    espaciosDeportivos: [{ type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' }],
    horarioApertura: { type: String },
    horarioCierre: { type: String },
    horarioAtencion: { type: String },
    horarioAtencionFin: { type: String },
    status: { type: Boolean, default: true },
    imgUrl: { type: String, required: false },

}, {
    timestamps: true
});

const ComplejosDeportivosPteAlto = mongoose.model('complejosDeportivosPteAlto', complejosDeportivosPteAltoSchema);

module.exports = ComplejosDeportivosPteAlto;