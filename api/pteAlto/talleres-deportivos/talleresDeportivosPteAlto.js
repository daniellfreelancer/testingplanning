const mongoose = require('mongoose');

// Sub-esquema para sesiones individuales del taller
const sesionTallerSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    dia: { type: String }, // nombre del día: lunes, martes, etc.
    usuariosInscritos: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    capacidad: { type: Number }, // capacidad específica de esta sesión (hereda del taller si no se especifica)
    estado: { type: String, enum: ['activa', 'cancelada', 'completada'], default: 'activa' },
    notas: { type: String }
}, {
    timestamps: true
});

const talleresDeportivosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    galeria: [{ type: String }],
    video: { type: String },
    link: { type: String },
    espacioDeportivo: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' },
    capacidad: { type: Number }, // capacidad por sesión (default)
    valor: { type: Number },
    pago: { type: Boolean },
    horaInicio: { type: Array }, // Mantener para compatibilidad
    horaFin: { type: Array }, // Mantener para compatibilidad
    dias: { type: Array }, // Mantener para compatibilidad
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }], // usuarios inscritos al taller (general)
    profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    sesiones: [sesionTallerSchema], // Array de sesiones individuales
    status: { type: Boolean, default: true },

}, {
    timestamps: true
});

const TalleresDeportivosPteAlto = mongoose.model('talleresDeportivosPteAlto', talleresDeportivosPteAltoSchema);

module.exports = TalleresDeportivosPteAlto;