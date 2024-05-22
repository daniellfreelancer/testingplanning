const mongoose = require('mongoose')


const monthlyReportSchema = new mongoose.Schema({

    reported: { type: mongoose.Types.ObjectId, ref: 'user' },
    reportDay: { type: String },
    workshop: { type: mongoose.Types.ObjectId, ref: 'workshop' },
    report: { type: String },
    teacherName: { type: String },
    teacherLastname: { type: String },
    teacherEmail: { type: String },
    teacherPhone: { type: String },
    teacherRUT: { type: String },
    elapsedClassTime: { type: Number },
    startClassTime: { type: String },
    attendance:{type: Array},
    relevantEvents: { type: String },
    obstaclesPresented : { type: String },
    solutionsPresented: { type: String },
    improveAspects : { type: String },
})


const REPORT = mongoose.model(
    'monthlyReport',
    monthlyReportSchema
)

module.exports = REPORT