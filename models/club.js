const { string } = require('joi')
const mongoose = require('mongoose')

const clubSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    logo: { type: String },
    email: {type: String,required: true},  
    phone: {type: String, required: true},
    rut: {type: String, required: true}, 
    devices: [{type: mongoose.Types.ObjectId, ref:'device'}],
    students: [{ type: mongoose.Types.ObjectId, ref: 'student' }],
    teachers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    institution:[{type: mongoose.Types.ObjectId, ref:'insti'}],
    categories:[{type: mongoose.Types.ObjectId, ref:'sportCategory'}],
    season: [{type: String}],
    fixture:[{type: mongoose.Types.ObjectId, ref:''}],
    championship :[{type: mongoose.Types.ObjectId, ref:''}],
},{
    timestamps: true,
})

const CLUB = mongoose.model(
    'club',
    clubSchema
)

module.exports = CLUB