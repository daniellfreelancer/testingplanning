const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    classroom: {
        type: mongoose.Types.ObjectId,
        ref: 'classroom',
        required: false,
    },
    workshop: {
        type: mongoose.Types.ObjectId,
        ref: 'workshop',
        required: false,
    },
    vmClass: {
        type: mongoose.Types.ObjectId,
        ref: 'resumeVMClass',
        required: true,
    },
    student:{
        type: mongoose.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    sleepLevel: {
        type: Number,
        min: 0,
        max: 7,
    },
    stressLevel: {
        type: Number,
        min: 0,
        max: 7,
    },
    fatigueLevel: {
        type: Number,
        min: 0,
        max: 7,
    },
    muscleLevel: {
        type: Number,
        min: 0,
        max: 7,
    },
    moodLevel: {
        type: Number,
        min: 0,
        max: 7,
    },
    status:{
        type: Boolean
    },
    sportCategory:{
        type: mongoose.Types.ObjectId,
        ref: 'sportCategory',
        required: false,
    },
    sportResume:{
        type: mongoose.Types.ObjectId,
        ref: 'resumeVMTraining',
        required: false,
    },
},
{
    timestamps: true,
});

const SURVEY = mongoose.model('survey', surveySchema);

module.exports = SURVEY;
