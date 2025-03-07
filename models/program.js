const mongoose = require('mongoose')


const programSchema = new mongoose.Schema({
    name: { type: String, required: true },
    admins: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    teachers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    workshops: [{ type: mongoose.Types.ObjectId, ref: 'workshop' }],
    students: [{ type: mongoose.Types.ObjectId, ref: 'student' }],
    institution: [{ type: mongoose.Types.ObjectId, ref: 'insti' }],
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    rut: { type: String, required: true },
    devices: [{ type: mongoose.Types.ObjectId, ref: 'device' }],
    // Campos específicos para escuelas de fútbol privadas
    category: { type: String }, // Categoría de la escuela (ej. infantil, juvenil, femenino)
    trainingDays: [{ type: String }], // Días de entrenamiento (ej. lunes, miércoles, viernes)
    trainingTime: { type: String }, // Horario de entrenamiento (ej. 18:00 - 20:00)
    field: { type: String }, // Campo de entrenamiento
    ageGroups: [{ type: String }], // Grupos de edad (ej. 6-8 años, 9-12 años)
    monthlyFee: { type: Number }, // Cuota mensual
    seasonStart: { type: Date }, // Inicio de la temporada
    seasonEnd: { type: Date }, // Fin de la temporada
    uniform: { type: String }, // Descripción del uniforme
    level: { type: String, enum: ['iniciación', 'intermedio', 'avanzado'] }, // Nivel de la escuela.
    coach: [{ type: mongoose.Types.ObjectId, ref: 'user' }],// entrenador principal de la escuela.
    assistantCoaches: [{ type: mongoose.Types.ObjectId, ref: 'user' }],// entrenadores asistentes de la escuela.
    medicalStaff: [{ type: mongoose.Types.ObjectId, ref: 'user' }], //staff médico de la escuela.
    enrollmentStartDate: { type: Date }, // fecha de inicio de inscripciones
    enrollmentEndDate: { type: Date }, // fecha de fin de inscripciones
},
    {
        timestamps: true,
    })

const PROGRAM = mongoose.model(
    'program',
    programSchema
)

module.exports = PROGRAM