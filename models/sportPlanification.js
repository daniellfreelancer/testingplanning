const mongoose = require('mongoose')


const sportPlanificationSchema = new mongoose.Schema({
        sport: {type: mongoose.Types.ObjectId, ref:'sportCategory'},
        startDate: { type: String },
        endDate: { type: String },
        duration: { type: Number },
        content: { type: String },
        learningObjectives: { type: String},
        activities: { type: String },
        materials: { type: Array },
        otherMaterials:{type: String},
        quiz: {type: String}
     
    }, { timestamps: true });

    sportPlanificationSchema.methods.setQuiz = function setQuiz (filename) {

        this.quiz = `${process.env.HOST_IMAGE}/public/quiz/${filename}`
    }

    module.exports = mongoose.model('sportPlanification', sportPlanificationSchema)