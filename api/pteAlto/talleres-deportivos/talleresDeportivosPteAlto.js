const mongoose = require('mongoose');

// Sub-esquema para variantes del taller
const varianteTallerSchema = new mongoose.Schema({
    nombre: { type: String, required: true }, // Ej: "8 a 12 años"
    descripcion: { type: String },
    edadMin: { type: Number },
    edadMax: { type: Number },
    genero: { type: String, enum: ['M', 'F', 'M/F', 'Todos'], default: 'Todos' },
    capacidad: { type: Number, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    espaciosAdicionales: [{ type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' }], // Espacios específicos para esta variante
    precioIndividual: { type: Number }, // Precio si se inscribe solo a esta variante
    usuariosInscritos: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    sesiones: [{
        fecha: { type: Date, required: true },
        dia: { type: String },
        usuariosInscritos: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
        estado: { type: String, enum: ['activa', 'cancelada', 'completada'], default: 'activa' },
        notas: { type: String }
    }]
}, {
    timestamps: true
});

// Sub-esquema para sesiones individuales del taller (DEPRECATED - mantener por compatibilidad)
const sesionTallerSchema = new mongoose.Schema({
    fecha: { type: Date, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    dia: { type: String },
    usuariosInscritos: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    capacidad: { type: Number },
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

    // NUEVO SISTEMA - Múltiples espacios
    complejo: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto' },
    deporte: { type: String }, // futbol, padel, tenis, etc.
    espaciosComunes: [{ type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' }], // Espacios que usan todas las variantes

    // Sistema de variantes
    tipoInscripcion: { type: String, enum: ['completa', 'por_variante'], default: 'completa' },
    variantes: [varianteTallerSchema],
    precioCompleto: { type: Number }, // Precio si se inscribe a todas las variantes (inscripción completa)
    capacidadTotal: { type: Number }, // Suma de capacidades de todas las variantes

    // Fechas y días (aplican a todas las variantes)
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    dias: { type: Array }, // días de la semana

    // CAMPOS LEGACY - mantener para compatibilidad con talleres antiguos
    espacioDeportivo: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' },
    capacidad: { type: Number },
    valor: { type: Number },
    pago: { type: Boolean },
    horaInicio: { type: Array },
    horaFin: { type: Array },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    sesiones: [sesionTallerSchema],

    profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    status: { type: Boolean, default: true },

}, {
    timestamps: true
});

const TalleresDeportivosPteAlto = mongoose.model('talleresDeportivosPteAlto', talleresDeportivosPteAltoSchema);

module.exports = TalleresDeportivosPteAlto;