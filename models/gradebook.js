const mongoose = require('mongoose');

const gradebookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    classroom: {
        type: mongoose.Types.ObjectId,
        ref: 'classroom',
        required: true,
    },
    notation: {
        type: Number,
        min: 0,
        max: 10,
    },
    teacher:{
        type : mongoose.Types.ObjectId,
        ref:'user'
    },
    student:{
        type : mongoose.Types.ObjectId,
        ref:'student'
    }
},
{
    timestamps: true,
})


const GRADEBOOK = mongoose.model('gradebook', gradebookSchema);

module.exports = GRADEBOOK