const mongoose = require('mongoose');

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
    edadMin: { type: Number },
    edadMax: { type: Number },
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
    usuariosBaja: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    sesiones: [sesionTallerSchema], //  estas van a ser las clases / sesiones que se van a crear para el taller
    profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    coordinadores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }],
    status: { type: Boolean, default: true },
    destacada: { type: Boolean, default: false },
    creadoPor: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' },
    informacionHorarios: { type: Array }, // aqui se van a mostrar los dias y horarios seleccionados para el taller
    sexo: { type: String, enum: ['masculino', 'femenino', 'ambos'], default: 'ambos' },
    supervision: [{ type: mongoose.Types.ObjectId, ref: 'supervisionPteAlto' }],


}, {
    timestamps: true
});

const TalleresDeportivosPteAlto = mongoose.model('talleresDeportivosPteAlto', talleresDeportivosPteAltoSchema);

module.exports = TalleresDeportivosPteAlto;