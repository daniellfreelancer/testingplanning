const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    fileStudent: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        default: 'PENDING',
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
    dueDate:{
        type: String,
        required: false,
    },
    feedback:{
        type: String,
        required: false,
    }
},
{
    timestamps: true,
});

const TASK = mongoose.model('task', taskSchema);

module.exports = TASK;
