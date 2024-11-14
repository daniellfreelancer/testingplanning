const mongoose = require('mongoose')

const sportCategorySchema = new mongoose.Schema({
    name:{type: String},
    teacher:[{type: mongoose.Types.ObjectId, ref:'user'}],
    students:[{type: mongoose.Types.ObjectId, ref:'student'}],
    planner:[ {type: mongoose.Types.ObjectId, ref:''}],
    training:[ {type: mongoose.Types.ObjectId, ref:''}],
    trainingHistory:[{type: mongoose.Types.ObjectId, ref:''}],
    events:[ {type: mongoose.Types.ObjectId, ref:''}],
    address:{type: String},
    contact:{type: String},
    email: {type: String},  
    phone: {type: String},
    ageRange: {type: Array},
    days: {type: Array},
    hours: {type: Object},
    hubId: {type: Number, require: false}
},
{
    timestamps: true,
})

const SPORT_CATEGORY = mongoose.model(
    'sportCategory',
    sportCategorySchema
)

module.exports = SPORT_CATEGORY