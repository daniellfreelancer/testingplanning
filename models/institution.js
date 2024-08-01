const mongoose = require('mongoose')


const instiSchema = new mongoose.Schema({
    name:{type: String, required: true},
    admins:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teachers:[{type: mongoose.Types.ObjectId, ref:'user'}],
    schools:[{type: mongoose.Types.ObjectId, ref:'school'}],
    programs:[{type: mongoose.Types.ObjectId, ref:'program'}],
    address:{type: String, required: true},
    email: {type: String,required: true},
    phone: {type: String, required: true},
    rut: {type: String, required: true},
    hubId: {type: Number, required: false},
},
{
    timestamps: true,
})

const INSTITUTION = mongoose.model(
    'insti',
    instiSchema
)

module.exports = INSTITUTION