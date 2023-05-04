const mongoose = require('mongoose')


const planificationSchema = new mongoose.Schema({

    classroom: {type: mongoose.Types.ObjectId, ref:'classroom'},
    startDate: { type: String, required: true },
    endDate: { type: String },
    duration: { type: Number, required: true },
    schoolBlock: { type: Number, required: true },
    content: { type: String, required: true },
    classObjectives: { type: Array, required: true },
    evaluationIndicators: { type: Array, required: true },
    evaluationIndicatorsTeacher: { type: Array, required: true },
    learningObjectives: { type: Array, required: true },
    activities: { type: String, required: true },
    materials: { type: Array, required: true },
    otherMaterials: { type: String, required: true },
    evaluationType: { type: String, required: true },
   
  }, { timestamps: true });
  


const PLANIFICATION = mongoose.model(
    'planification',
    planificationSchema
)

module.exports = PLANIFICATION