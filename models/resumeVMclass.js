const mongoose = require('mongoose')


const resumeVMSchema = new mongoose.Schema({
    byTeacher:{type: mongoose.Types.ObjectId, ref:'user'},
    plannerClass:{type: mongoose.Types.ObjectId, ref:'planification', required: false},
    workshopClass:{type: mongoose.Types.ObjectId, ref:'workshopPlanification', required: false},
    classroomId:{type: mongoose.Types.ObjectId, ref:'classroom', required: false},
    workshopId:{type: mongoose.Types.ObjectId, ref:'workshop', required: false},
    plannerNoClass: {type:Array},
    elapsedClassTime:{type: Number},
    startClassTime:{type: String},
    endClassTime:{type: String},
    extraActivities:{type: Array},
    presentStudents:{type: Array},
    evaluationNotation:{type: Array},
    observationsClass:{type: Array},
    imgFirstVMClass:{type: String},
    imgSecondVMClass:{type: String},
    imgThirdVMClass:{type: String},

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
    'resumeVMClass',
    resumeVMSchema
)

module.exports = RESUMEVMClass
