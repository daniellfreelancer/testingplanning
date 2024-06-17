const mongoose = require('mongoose');


const dusunSMSchema = new mongoose.Schema({
    ble_addr: {type : String},
    scan_time: {type: Number},
    data: {type: String},
    Hr: { type: Number },
    Temperature: {type: String},
    dev_name: {type: String},
    user: {type: mongoose.Types.ObjectId, ref:'user', require: false},
    plannerClass:{type: mongoose.Types.ObjectId, ref:'planification', required: false},
    workshopClass:{type: mongoose.Types.ObjectId, ref:'workshopPlanification', required: false},

}, {
    timestamps: true
})

const DUSUNSM = mongoose.model('dusunSM', dusunSMSchema);

module.exports = DUSUNSM