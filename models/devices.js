const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({

    deviceId: {type: String},
    deviceName: {type: String},
    deviceBpa: { type: Number, required: true },
    deviceBpm:{ type: Number, required: true },
    deviceSteps: { type: Number },
    deviceStatus: {type: Boolean, default: false},
    deviceConnected: {type: Boolean},
    school: [{type: mongoose.Types.ObjectId, ref:'school', required: false}],
    program: [{type: mongoose.Types.ObjectId, ref:'program', required: false}],

})

const DEVICE = mongoose.model( 'device', deviceSchema )

module.exports = DEVICE