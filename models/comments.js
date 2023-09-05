const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user' },
    text: { type: String, required: true },
    replies: [
        {
            user: { type: mongoose.Types.ObjectId, ref: 'user' },
            text: { type: String, required: true },
        },
    ],
},
{
    timestamps: true,
});

const COMMENT = mongoose.model('comment', commentSchema);

module.exports = COMMENT;
