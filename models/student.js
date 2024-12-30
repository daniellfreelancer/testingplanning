const mongoose = require('mongoose')


const studentSchema = new mongoose.Schema({
    name:{type: String, required: true},
    lastName:{type: String, required: true},
    age:{type: Number, required: true},
    birth:{type: String},
    weight:{type: Number, required: true},
    size:{type: Number, required: true},
    classroom: [{type: mongoose.Types.ObjectId, ref:'classroom', required: false}],
    school: [{type: mongoose.Types.ObjectId, ref:'school', required: false}],
    email: {type: String,required: true},  
    phone: {type: String, required: true},
    rut: {type: String, required: true}, 
    gender: {type: String, required: true},
    school_representative: {type: String, },
    imgUrl: {type: String},
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
    notifications:[{type: Object}],
    challenges:[{type: Object}],
    from: [{type:String}],  // from google o formularios
    verified:{type:Boolean},    // si es verificado por codigos
    code: {type:String},
    fitData:[{type: mongoose.Types.ObjectId, ref:'fitdata', required: false}],
    controlParental:{type:Boolean},
    vmRole: [{ type: String }],
    skills:[{ type: Object }],
    quality:[{ type: Object }],
    membership:[{ type: Object }]
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
