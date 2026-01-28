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
    complejo: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto' },
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
    profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    asistencia: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    capacidad: { type: Number },
    estado: { type: String, enum: ['activa', 'cancelada', 'completada'], default: 'activa' },
    notas: { type: String },
    galeria: [{ type: String }],
}, {
    timestamps: true
});

const talleresDeportivosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    imgUrl: [{ type: String }],
    video: { type: String },
    link: { type: String },
    categoria: { type: String },
    complejo: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto' },
    sede: { type: mongoose.Types.ObjectId, ref: 'sedesDeportivasPteAlto' },
    deporte: { type: String }, // futbol, padel, tenis, etc.
    precioCompleto: { type: Number }, // Precio si se inscribe a todas las variantes (inscripción completa)
    capacidadTotal: { type: Number }, // Suma de capacidades de todas las variantes
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    horaInicio: { type: Array },
    horaFin: { type: Array },
    dias: { type: Array }, // días de la semana
    fechaPublicacion: { type: Date },
    espacioDeportivo: [{ type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' }], // puede ser uno o varios espacios
    capacidad: { type: Number },
    valor: { type: Number },
    pago: { type: Boolean },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    sesiones: [sesionTallerSchema], //  estas van a ser las clases / sesiones que se van a crear para el taller
    profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    coordinadores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    status: { type: Boolean, default: true },

}, {
    timestamps: true
});

const TalleresDeportivosPteAlto = mongoose.model('talleresDeportivosPteAlto', talleresDeportivosPteAltoSchema);

module.exports = TalleresDeportivosPteAlto;