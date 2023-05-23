const mongoose = require('mongoose')


const resumeVMSchema = new mongoose.Schema({
    byTeacher:[{type: mongoose.Types.ObjectId, ref:'user'}],
    plannerClass:[{type: mongoose.Types.ObjectId, ref:'planification'}],
    plannerNoClass: {type:Array},
    elapsedClassTime:{type: Number, required: true},
    startClassTime:{type: String, required: true},
    endClassTime:{type: String, required: true},
    extraActivities:{type: Array, required: true},
    presentStudents:{type: Array, required: true},
    evaluationNotation:{type: Array, required: true},
    observationsClass:{type: Array, required: true},
    imgFirstVMClass:{type: String, required: true},
    imgSecondVMClass:{type: String, required: true},
    imgThirdVMClass:{type: String, required: true},

},
{
    timestamps: true,
}
)

resumeVMSchema.methods.setImgFirstVMClassUrl = function setImgFirstVMClassUrl(filename) {
    this.imgFirstVMClass = `${process.env.HOST_IMAGE}/public/${filename}`;
  };
  
  resumeVMSchema.methods.setImgSecondVMClassUrl = function setImgSecondVMClassUrl(filename) {
    this.imgSecondVMClass = `${process.env.HOST_IMAGE}/public/${filename}`;
  };
  
  resumeVMSchema.methods.setImgThirdVMClassUrl = function setImgThirdVMClassUrl(filename) {
    this.imgThirdVMClass = `${process.env.HOST_IMAGE}/public/${filename}`;
  };



const RESUMEVMClass = mongoose.model(
    'resumeClass',
    resumeVMSchema
)

module.exports = RESUMEVMClass
