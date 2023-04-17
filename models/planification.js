const mongoose = require('mongoose')


const planificationSchema = new mongoose.Schema({

    classroom: {type: mongoose.Types.ObjectId, ref:'classroom'},
    date: { type: String, required: true },
    duration: { type: Number, required: true },
    classObjectives: { type: String, required: true },
    learningObjectives: { type: String, required: true },
    evaluationIndicators: { type: String, required: true },
    skills: { type: String, required: true },
    activities: { type: String, required: true },
    materials: { type: String, required: true },
    evaluationType: { type: String, required: true },
    content: { type: String, required: true },
    
  }, { timestamps: true });
  


const PLANIFICATION = mongoose.model(
    'planification',
    planificationSchema
)

module.exports = PLANIFICATION