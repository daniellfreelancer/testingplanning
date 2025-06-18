const mongoose = require('mongoose')


const trainingAppSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: false },
    student: { type: mongoose.Types.ObjectId, ref:'student', required: false },
    startTime: { type: String },
    heartRate: { type: Array },
    endTime: { type: String },
    sport: { type: String},
},
{
    timestamps: true,
})

const TRAININGAPP = mongoose.model('trainingApp', trainingAppSchema)


module.exports = TRAININGAPP