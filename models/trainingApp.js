const mongoose = require('mongoose')


const trainingAppSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: false },
    student: { type: mongoose.Types.ObjectId, ref:'student', required: false },
    timestamp: { type: String, required: true },
    heartRate: { type: Array, required: true },
    time: { type: Number, required: true },
    activity: { type: String, required: true },


},
{
    timestamps: true,
})

const TRAININGAPP = mongoose.model('trainingApp', trainingAppSchema)


module.exports = TRAININGAPP