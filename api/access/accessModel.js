const mongoose = require('mongoose');

const accessControlSchema = new mongoose.Schema({
    institution:{
        type: mongoose.Types.ObjectId,
        ref: 'insti',}
    ,
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    student :{
        type: mongoose.Types.ObjectId,
        ref: 'student',
    },
    userGym:{
        type: mongoose.Types.ObjectId,
        ref: 'userGym',
    },
    userAuth:{
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    userGymAuth:{
        type: mongoose.Types.ObjectId,
        ref: 'userGym',
    },
    accessFrom:{ type : String}
    
}, {
    timestamps: true,
})

module.exports = mongoose.model('accessControl', accessControlSchema)