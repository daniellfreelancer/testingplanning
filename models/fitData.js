const mongoose = require('mongoose');

const fitDataSchema = new mongoose.Schema({

    steps: {
        type: Number,
    },
    caloriesBurned: {
        type: Number,
    },
    distance: {
        type: Number
    },
    heartRate: {
        type: Number
    },
    userType : {
        type: String
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: false
    },
    student : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        require: false
    }
}
,
{
    timestamps: true,
})

const FITDATA = mongoose.model('fitdata', fitDataSchema);

module.exports = FITDATA;