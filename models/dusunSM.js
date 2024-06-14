const mongoose = require('mongoose');


const dusunSMSchema = new mongoose.Schema({
    ble_addr: {type : String},
    scan_time: {type: Number},
    data: {type: String},
    Hr: { type: Number },
    Temperature: {type: String},
    dev_name: {type: String}
}, {
    timestamps: true
})

const DUSUNSM = mongoose.model('dusunSM', dusunSMSchema);

module.exports = DUSUNSM