const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    username:{type: String, required: true},
    email:{type: String, required: true},
    password:[{type: String, required: true}],
    role: {type: String},
    logged: {type: String, required: true}
})

const USERADMIN = mongoose.model(
    'admin',
    adminSchema
)

module.exports = USERADMIN