const mongoose = require('mongoose')


const plannerSchema = new mongoose.Schema({
    GRADE: { type: Number, required: true }, 
    LEVEL: { type: String, required: true }, 
    REGULAR_PROGRAM_UNIT: [{
        UNIT: {type: Number, required: true}, 
        TITLE:{type: String, required: true},
        OBJECTIVES : {type: String, required: true},
        APRENDIZAJES: [{
            TIPO_DE_APRENDIZAJE: {type: String, required: true},
            OBJETIVO_DE_APRENDIZAJE: {type: String, required: true},
            OBJETIVOS_DE_LA_CLASE: {type: String, required: true},
            INDICADOR_DE_EVALUACION: {type: Object, required: true},
            ACTIVIDADES: [{type: String, required: true}],
            MATERIALES: [{type: String, required: true}],
            TIPO_DE_EVALUACION: [{type: String, required: true}]
        }],
        RECURSOS:[{
            TITULO: {type: String, required: true},
            CONTENIDO: {type: String, required: true},
        }]
     }],
    createdAt: { type: Date, default: Date.now },
})

const PLANNER = mongoose.model(
    'planner',
    plannerSchema
)

module.exports = PLANNER