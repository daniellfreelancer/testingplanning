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
    school_representative: {type: String, required: true}
},
{
    timestamps: true,
})

const STUDENT = mongoose.model(
    'student',
    studentSchema
)
module.exports = STUDENT
