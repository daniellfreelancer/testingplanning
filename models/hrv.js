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
    hF_peak : {type: Number},
    hF_power: {type: Number},
    hF_power_nu: {type: Number},
    hF_power_prc: {type: Number},
    lF_HF_power: {type: Number},
    lF_peak: {type: Number},
    lF_power: {type: Number},
    lF_power_nu: {type: Number},
    lF_power_prc: {type: Number},
    vLF_peak: {type: Number},
    vLF_power: {type: Number},
    vLF_power_prc: {type: Number},
    tot_power: {type: Number},
    pns_index: {type: Number},
    sns_index: {type: Number},
    stress_index: {type: Number},
    readiness_index: {type: Number},

    
},{
    timestamps: true,
})

const HRV = mongoose.model('hrv', hrvSchema)

module.exports = HRV
