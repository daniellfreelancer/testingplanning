const mongoose = require('mongoose')


const studentSchema = new mongoose.Schema({
    name:{type: String, required: true},
    lastName:{type: String, required: true},
    age:{type: Number, required: true},
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
    bio: {type: String},
    tasks:[{type: Object}],
    gradebook:[{type: Object}],
    notifications:[{type: Object}],
    from: [{type:String}],  // from google o formularios
    verified:{type:Boolean},    // si es verificado por codigos
    code: {type:String},
    fitData:[{type: mongoose.Types.ObjectId, ref:'fitdata', required: false}],
    controlParental:{type:Boolean},
    healtRegister01:{type: Number, required: false},
    healtRegister02:{type: Number, required: false},
    healtRegister03:{type: Number, required: false},
    healtRegister04:{type: Number, required: false},
    healtRegister05:{type: Number, required: false},
    healtRegister06:{type: Number, required: false},
    healtRegister07:{type: Number, required: false},
    healtRegister08:{type: Number, required: false},
    healtRegister09:{type: Number, required: false},
    healtRegister10:{type: Number, required: false},
    healtRegister11:{type: Number, required: false},
    healtRegister12:{type: Number, required: false},
    healtRegister13:{type: Number, required: false},
    healtRegister14:{type: Number, required: false},
    healtRegister15:{type: Number, required: false},
    healtRegister16:{type: Number, required: false},
    healtRegister17:{type: Number, required: false},
    healtRegister18:{type: Number, required: false},
    healtRegister19:{type: Number, required: false},
    healtRegister20:{type: Number, required: false},
    healtRegister21:{type: Number, required: false},
    healtRegister22:{type: Number, required: false},
    healtRegister23:{type: Number, required: false},
    healtRegister24:{type: Number, required: false},
    healtRegister25:{type: Number, required: false},
    healtRegister26:{type: Number, required: false},
    healtRegister27:{type: Number, required: false},
    healtRegister28:{type: Number, required: false},
    healtRegister29:{type: Number, required: false},
    healtRegister30:{type: Number, required: false},
    healtRegister31:{type: Number, required: false},
    healtRegister32:{type: Number, required: false},
    healtRegister33:{type: Number, required: false},
    healtRegister34:{type: Number, required: false},
    healtRegister35:{type: Number, required: false},
    healtRegister36:{type: Number, required: false},
    healtRegister37:{type: Number, required: false},
    healtRegister38:{type: Number, required: false},
    healtRegister39:{type: Number, required: false},
    healtRegister40:{type: Number, required: false},
    healtRegister41:{type: Number, required: false},
    healtRegister42:{type: Number, required: false},
    healtRegister43:{type: Number, required: false},
    healtRegister44:{type: Number, required: false},
    healtRegister45:{type: Number, required: false},
    healtRegister46:{type: Number, required: false},
    healtRegister47:{type: Number, required: false},
    healtRegister48:{type: Number, required: false},
    healtRegister49:{type: Number, required: false},
    healtRegister50:{type: Number, required: false}
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
