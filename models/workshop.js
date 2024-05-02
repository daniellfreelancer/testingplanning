const mongoose = require('mongoose')


const workshopSchema = new mongoose.Schema({
    name:{type: String},
    teacher:[{type: mongoose.Types.ObjectId, ref:'user'}],
    students:[{type: mongoose.Types.ObjectId, ref:'student'}],
    planner:[ {type: mongoose.Types.ObjectId, ref:'workshopPlanification'}],
    workshopHistory:[{type: mongoose.Types.ObjectId, ref:'resumeVMClass'}],
    address:{type: String},
    email: {type: String},  
    phone: {type: String},
    ageRange: {type: Array},
    days : {type: Array},
    hours : {type: Object}

})

const WORKSHOP = mongoose.model(
    'workshop',
    workshopSchema)

module.exports = WORKSHOP