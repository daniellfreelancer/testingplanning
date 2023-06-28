const mongoose = require('mongoose')


const workshopPlanificationSchema = new mongoose.Schema({

    workshop: {type: mongoose.Types.ObjectId, ref:'workshop'},
    startDate: { type: String },
    endDate: { type: String },
    duration: { type: Number },
    schoolBlock: { type: Number },
    content: { type: String },
    learningObjectives: { type: String},
    activities: { type: String },
    materials: { type: Array },
    otherMaterials:{type: String},
    quiz: {type: String}
   
  }, { timestamps: true });
  
  workshopPlanificationSchema.methods.setQuiz = function setQuiz (filename) {

    this.quiz = `${process.env.HOST_IMAGE}/public/quiz/${filename}`
  }

const WORKSHOP_PLANIFICATION = mongoose.model(
    'workshopPlanification',
    workshopPlanificationSchema
)

module.exports = WORKSHOP_PLANIFICATION