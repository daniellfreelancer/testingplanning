const mongoose = require('mongoose')


const adminSchema = new mongoose.Schema({
    name:{type: String},
    lastName:{type: String},
    email:{type: String},
    password:[{type: String, required: true}],
    role: {type: String},
    rut: {type: String},
    logged: {type: String, required: true},
    imgUrl: {type: String},
    bio: {type: String},
    phone: {type: String},
    gender: {type: String},
    age:{type: Number},
    weight:{type: Number},
    size:{type: Number},
})

adminSchema.methods.setImgUrl = function setImgUrl (filename) {

    this.imgUrl = `${process.env.HOST_IMAGE}/public/${filename}`
  }

const USERADMIN = mongoose.model(
    'user',
    adminSchema
)

module.exports = USERADMIN