const mongoose = require('mongoose')


const workshopSchema = new mongoose.Schema({
    name:{type: String},
    teacher:[{type: mongoose.Types.ObjectId, ref:'user'}],
    students:[{type: mongoose.Types.ObjectId, ref:'student'}],
    planner:[ {type: mongoose.Types.ObjectId, ref:'workshopPlanification'}],
    workshopHistory:[{type: mongoose.Types.ObjectId, ref:'resumeVMClass'}],
    address:{type: String},
    email: {type: String},  
    phone: {type: String},
    ageRange: {type: Array},
    days : {type: Array},
    hours : {type: Object},
    hubId: {type: Number, require: false},
    // Campos específicos para categorías de escuelas de fútbol
    category: { type: String }, // Categoría principal (ej. 'Fútbol Infantil', 'Fútbol Juvenil')
    level: { type: String, enum: ['iniciación', 'intermedio', 'avanzado'] }, // Nivel de la categoría
    field: { type: String }, // Campo de entrenamiento específico de la categoría
    coach: [{ type: mongoose.Types.ObjectId, ref: 'user' }], // Entrenador principal de la categoría
    assistantCoaches: [{ type: mongoose.Types.ObjectId, ref: 'user' }], // Entrenadores asistentes de la categoría
    medicalStaff: [{ type: mongoose.Types.ObjectId, ref: 'user' }], // Staff médico de la categoría
    uniform: { type: String }, // Descripción del uniforme de la categoría
    team: { type: mongoose.Types.ObjectId, ref: 'team' }, // Equipo relacionado a esta categoria.
    seasonStart: { type: Date }, // Inicio de la temporada de la categoría
    seasonEnd: { type: Date }, // Fin de la temporada de la categoría
})

const WORKSHOP = mongoose.model(
    'workshop',
    workshopSchema)

module.exports = WORKSHOP