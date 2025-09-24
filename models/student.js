const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name:{type: String, required: false},
    lastName:{type: String, required: false},
    age:{type: Number, required: false},
    birth:{type: String},
    weight:{type: Number, required: false},
    size:{type: Number, required: false},
    classroom: [{type: mongoose.Types.ObjectId, ref:'classroom', required: false}],
    school: [{type: mongoose.Types.ObjectId, ref:'school', required: false}],
    email: {type: String,required: true},  
    phone: {type: String, required: false},
    rut: {type: String, required: false}, 
    gender: {type: String, required: false},
    school_representative: {type: String, },
    imgUrl: {type: String},
    imgRekognition: { type: String },
    password:[{type: String, required: true}],
    role: {type: String},
    logged: {type: String},
    workshop: [{type: mongoose.Types.ObjectId, ref:'workshop'}],
    program: [{type: mongoose.Types.ObjectId, ref:'program'}],
    clubs: [{ type: mongoose.Types.ObjectId, ref: 'club' }],
    sports: [{ type: mongoose.Types.ObjectId, ref: 'sportCategory' }],
    bio: {type: String},
    tasks:[{type: Object}],
    gradebook:[{type: Object}],
    notifications: [{ type: mongoose.Types.ObjectId, ref: 'notification' }],
    challenges:[{type: Object}],
    from: [{type:String}],  // from google o formularios
    verified:{type:Boolean},    // si es verificado por codigos
    code: {type:String},
    fitData:[{type: mongoose.Types.ObjectId, ref:'fitdata', required: false}],
    controlParental:{type:Boolean},
    vmRole: [{ type: String }],
    skills:[{ type: Object }],
    quality:[{ type: Object }],
    membership:[{ type: Object }],
    vitalmoveCategory: {type: String},
    institution: { type: mongoose.Types.ObjectId, ref: 'insti', required: false },
    scouting:[{ type: mongoose.Types.ObjectId, ref: 'scouting' }],

    // Datos físicos adicionales
    height: { type: Number, required: false }, // Altura en cm
    dominantFoot: { type: String, enum: ['derecho', 'izquierdo', 'ambos'], required: false },
    position: { type: String, required: false }, // Posición en el campo
    comuna: { type: String, required: false },
    region: { type: String, required: false },

    // Historial deportivo
    sportHistory: [{
        club: { type: String },
        category: { type: String },
        from: { type: Date },
        to: { type: Date },
        achievements: [{ type: String }]
    }],
    
    // Datos de rendimiento
    performance: {
        matches: { type: Number, default: 0 }, // Partidos jugados
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
        minutesPlayed: { type: Number, default: 0 }
    },
    // Datos de representación
    representation: {type: Object}
},
{
    timestamps: true,
})

studentSchema.methods.setImgUrl = function setImgUrl (filename) {

    this.imgUrl = `${process.env.HOST_IMAGE}/public/${filename}`
  }

const STUDENT = mongoose.model(
    'student',
    studentSchema
)
module.exports = STUDENT
