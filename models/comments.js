const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user' }, // Hace referencia a la colección "User"
    student: { type: mongoose.Types.ObjectId, ref: 'student' }, // Hace referencia a la colección "Student"
    text: { type: String, required: true },
    replies: [
        {
            user: { type: mongoose.Types.ObjectId, ref: 'user' }, // Hace referencia a la colección "User"
            student: { type: mongoose.Types.ObjectId, ref: 'student' }, // Hace referencia a la colección "Student"
            text: { type: String, required: true },
        },
    ],
},
{
    timestamps: true,
});

const COMMENT = mongoose.model('comment', commentSchema);

module.exports = COMMENT;
