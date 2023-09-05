const mongoose = require('mongoose');

const momentsSchema = new mongoose.Schema({
    user: { type : mongoose.Types.ObjectId, ref:'user'},
    momentImg : {type: String, require: true}

},
{
    timestamps: true,
})

const MOMENTS = mongoose.model('moment', momentsSchema)

module.exports = MOMENTS