const mongoose = require('mongoose')


const studentSchema = new mongoose.Schema({
    name:{type: String, required: true},
    lastName:{type: String, required: true},
    age:{type: Number, required: true},
    weight:{type: Number, required: true},
    size:{type: Number, required: true},
    classroom: [{type: mongoose.Types.ObjectId, ref:'classroom'}],
    school: [{type: mongoose.Types.ObjectId, ref:'school'}],
    email: {type: String,required: true},  
    phone: {type: String, required: true},
    rut: {type: String, required: true}, 
    gender: {type: String, required: true},
    school_representative: {type: String, },
    imgUrl: {type: String},
    password:[{type: String, required: true}],
    role: {type: String},
    logged: {type: String, required: true},
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
