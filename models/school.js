const mongoose = require('mongoose')


const schoolSchema = new mongoose.Schema({
    name:{type: String, required: true},
    admins:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teachers:[{type: mongoose.Types.ObjectId, ref:'user'}],
    classrooms: [{type: mongoose.Types.ObjectId, ref:'classroom'}],
    workshops: [{type: mongoose.Types.ObjectId, ref:'workshop'}],
    students: [{type: mongoose.Types.ObjectId, ref:'student'}],
    institution:[{type: mongoose.Types.ObjectId, ref:'insti'}],
    address:{type: String, required: true},
    email: {type: String,required: true},  
    phone: {type: String, required: true},
    rut: {type: String, required: true},
    devices: [{type: mongoose.Types.ObjectId, ref:'device'}]
},
{
    timestamps: true,
})

const SCHOOL = mongoose.model(
    'school',
    schoolSchema
)

module.exports = SCHOOL