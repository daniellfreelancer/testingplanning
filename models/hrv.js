const mongoose = require('mongoose')


const hrvSchema = new mongoose.Schema({
    student: { type: mongoose.Types.ObjectId, ref:'student', required: false },
    user: { type: mongoose.Types.ObjectId, ref:'user', required: false },
    hrData : {type: Array},
    rRData : {type: Array},
    rmssd : {type: Number},
    sdnn: {type: Number},
    ln: {type: Number},
    pnn50 : {type: Number},
    rrMean : {type: Number},
    device : {type: String},
    measurement : {type: String},
    survey: {type: Object},
    time: {type: String},
    hrv_analysis :{ type: Object},
    readiness: {type: Number}
},{
    timestamps: true,
})

const HRV = mongoose.model('hrv', hrvSchema)

module.exports = HRV
