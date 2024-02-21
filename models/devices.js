const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({

    deviceId: {type: String},
    deviceName: {type: String},
    deviceBpa: { type: Number},
    deviceBpm:{ type: Number},
    deviceSteps: { type: Number },
    href:{type: String},
    deviceStatus: {type: Boolean, default: false},
    deviceConnected: {type: Boolean},
    school: [{type: mongoose.Types.ObjectId, ref:'school', required: false}],
    program: [{type: mongoose.Types.ObjectId, ref:'program', required: false}],

},
{
    timestamps: true,
}
)

const DEVICE = mongoose.model( 'device', deviceSchema )

module.exports = DEVICE