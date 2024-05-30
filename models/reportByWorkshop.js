const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    reportedBy: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    institution: { type: mongoose.Types.ObjectId, ref: 'insti', required: true },
    reportDay: { type: String, required: true },
    workshop: { type: mongoose.Types.ObjectId, ref: 'workshop', required: true },
    report: { type: String, required: true },
    teacherName: { type: String, required: true },
    teacherEmail: { type: String, required: true },
    teacherPhone: { type: String, required: true },
    teacherRUT: { type: String, required: true },
    imgFirst: { type: String },
    imgSecond: { type: String },
    imgThird: { type: String },
    elapsedClassTime: { type: Number, required: true },
    startClassTime: { type: String, required: true },
    attendance: { type: Array, required: true },
    relevantEvents: { type: String, required: true },
    obstaclesPresented: { type: String, required: true },
    solutionsPresented: { type: String, required: true },
    improveAspects: { type: String, required: true },
    workshopClass :{ type: mongoose.Types.ObjectId, ref: 'resumeVMClass', required: true }
}, {
    timestamps: true
})

// Agregar índices para mejorar el rendimiento de las consultas
reportSchema.index({ reported: 1 })
reportSchema.index({ workshop: 1 })
reportSchema.index({ reportDay: 1 })

const REPORT = mongoose.model('report', reportSchema)

module.exports = REPORT