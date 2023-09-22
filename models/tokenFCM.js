const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({

    classroom: { type: mongoose.Types.ObjectId, ref: 'classroom' },
    workshop: { type: mongoose.Types.ObjectId, ref: 'workshop' },
    tokens: [{type:String}],
    tokenTeacher :  [{type:String}],
},
{
    timestamps: true,
});

const TOKENS = mongoose.model('token', tokenSchema);

module.exports = TOKENS;