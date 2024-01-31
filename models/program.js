const mongoose = require('mongoose')


const programSchema = new mongoose.Schema({
    name:{type: String, required: true},
    admins:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teachers:[{type: mongoose.Types.ObjectId, ref:'user'}],
    workshops: [{type: mongoose.Types.ObjectId, ref:'workshop'}],
    students: [{type: mongoose.Types.ObjectId, ref:'student'}],
    institution:[{type: mongoose.Types.ObjectId, ref:'insti'}],
    address:{type: String, required: true},
    email: {type: String,required: true},  
    phone: {type: String, required: true},
    rut: {type: String, required: true}, 
},
{
    timestamps: true,
})

const PROGRAM = mongoose.model(
    'program',
    programSchema
)

module.exports = PROGRAM