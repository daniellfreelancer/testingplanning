const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    name:{type: String},
    lastName:{type: String},
    email:{type: String},
    password:[{type: String, required: true}],
    role: {type: String},
    rut: {type: String},
    logged: {type: String, required: true}
})

const TEACHERS = mongoose.model(
    'teacher',
    teacherSchema
)

module.exports = TEACHERS