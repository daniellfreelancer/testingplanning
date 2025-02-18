const mongoose = require('mongoose')


const instiSchema = new mongoose.Schema({
    name:{type: String, required: true},
    admins:[{type: mongoose.Types.ObjectId, ref:'user'}],
    director:[{type: mongoose.Types.ObjectId, ref:'user'}],
    adminsOffice:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teachers:[{type: mongoose.Types.ObjectId, ref:'user'}],
    schools:[{type: mongoose.Types.ObjectId, ref:'school'}],
    programs:[{type: mongoose.Types.ObjectId, ref:'program'}],
    clubs:[{type: mongoose.Types.ObjectId, ref:'club'}],
    address:{type: String, required: true},
    email: {type: String,required: true},
    phone: {type: String, required: true},
    rut: {type: String, required: true},
    hubId: {type: Number, required: false},
    subscriptions: [{ type: String, required: false }],
    type: {type: String, required: true},
    vmType:{type: String},
    institutionDecentralized: [{type: mongoose.Types.ObjectId, ref:'instiDecentralized'}]

},
{
    timestamps: true,
})

const INSTITUTION = mongoose.model(
    'insti',
    instiSchema
)

module.exports = INSTITUTION