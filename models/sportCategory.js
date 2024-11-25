const mongoose = require('mongoose')

const sportCategorySchema = new mongoose.Schema({
    name:{type: String},
    teacher:[{type: mongoose.Types.ObjectId, ref:'user'}],
    students:[{type: mongoose.Types.ObjectId, ref:'student'}],
    club:[{type: mongoose.Types.ObjectId, ref:'club'}],
    trainingPlanner:[ {type: mongoose.Types.ObjectId, ref:''}],
    trainingHistory:[{type: mongoose.Types.ObjectId, ref:''}],
    events:[ {type: mongoose.Types.ObjectId, ref:''}],
    matchs:[ {type: mongoose.Types.ObjectId, ref:''}],
    address:{type: String},
    contact:{type: String},
    email: {type: String},  
    phone: {type: String},
    ageRange: {type: Array},
    days: {type: Array},
    hours: {type: Object},
    hubId: {type: Number, require: false},
    type : {type: String},
    cover: {type: String},
},
{
    timestamps: true,
})

const SPORT_CATEGORY = mongoose.model(
    'sportCategory',
    sportCategorySchema
)

module.exports = SPORT_CATEGORY