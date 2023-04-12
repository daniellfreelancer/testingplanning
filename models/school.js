const mongoose = require('mongoose')


const schoolSchema = new mongoose.Schema({
    name:{type: String, required: true},
    admins:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teachers:[{type: mongoose.Types.ObjectId, ref:'user'}],
    classroom: [{type: mongoose.Types.ObjectId, ref:'classroom'}],
    student: [{type: mongoose.Types.ObjectId, ref:'student'}],
    address:{type: String, required: true},
    email: {type: String,required: true},  
    phone: {type: String, required: true},
    rut: {type: String, required: true}, 
},
{
    timestamps: true,
})

const SCHOOL = mongoose.model(
    'school',
    schoolSchema
)

module.exports = SCHOOL