const mongoose = require('mongoose');

const momentsSchema = new mongoose.Schema({
    user: { type : mongoose.Types.ObjectId, ref:'user'},
    momentImg : {type: String, require: true},
    classroom: { type : mongoose.Types.ObjectId, ref: 'classroom', required: false },
    workshop: { type : mongoose.Types.ObjectId, ref: 'workshop', required: false },

},
{
    timestamps: true,
})

const MOMENTS = mongoose.model('moment', momentsSchema)

module.exports = MOMENTS