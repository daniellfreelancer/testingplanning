const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: { type : mongoose.Types.ObjectId, ref: 'user' },
    postImage: { type: String, required: true },
    likes: { type: Array, required: true },
    commentsAllow: { type: Boolean, required: true },
    text: { type: String },
    videoPost:{type: Boolean},
    comments: [ { type : mongoose.Types.ObjectId, ref: 'comment', required: false }], // Uso del esquema embebido para los comentarios
}, {
    timestamps: true,
});


const POSTS = mongoose.model('post', postSchema)

module.exports = POSTS