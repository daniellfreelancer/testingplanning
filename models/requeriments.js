const mongoose = require('mongoose')


const requirementsSchema = new mongoose.Schema({
    institution: {type: mongoose.Types.ObjectId, ref:'insti', required: false},
    requerimentType : {type: String, required: false},
    description: {type: String, required: false},
    imgFirstVMClass:{type: String},
    imgSecondVMClass:{type: String},
    imgThirdVMClass:{type: String},
    reqFieldOne:{type: String, required: false},
    reqFieldTwo:{type: String, required: false},
    reqFieldThree:{type: String, required: false},
    reqFieldFour:{type: String, required: false},
    reqFieldFive:{type: String, required: false},
    reqFieldSix:{type: String, required: false},
    price: {type: Number, required: false},
    currency:{type: String, required: false},
    status:{type: String, required: false},
},
{
    timestamps: true,
})

requirementsSchema.methods.setImgFirstVMClassUrl = function setImgFirstVMClassUrl(filename) {
    this.imgFirstVMClass = `${process.env.HOST_IMAGE}/public/${filename}`;
  };
  
  requirementsSchema.methods.setImgSecondVMClassUrl = function setImgSecondVMClassUrl(filename) {
    this.imgSecondVMClass = `${process.env.HOST_IMAGE}/public/${filename}`;
  };
  
  requirementsSchema.methods.setImgThirdVMClassUrl = function setImgThirdVMClassUrl(filename) {
    this.imgThirdVMClass = `${process.env.HOST_IMAGE}/public/${filename}`;
  };


const REQUERIMENTS = mongoose.model(
    'requirements',
    requirementsSchema
)

module.exports = REQUERIMENTS