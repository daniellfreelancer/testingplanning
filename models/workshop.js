const mongoose = require('mongoose')


const workshopSchema = new mongoose.Schema({
    name:{type: String},
    teacher:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teacherSubstitute:[{type: mongoose.Types.ObjectId, ref:'user'}],
    students:[{type: mongoose.Types.ObjectId, ref:'student'}],
    planner:[ {type: mongoose.Types.ObjectId, ref:'workshopPlanification'}],
    workshopHistory:[{type: mongoose.Types.ObjectId, ref:'resumeVMClass'}],
    address:{type: String, required: true},
    email: {type: String,required: true},  
    phone: {type: String, required: true},

})

const WORKSHOP = mongoose.model(
    'workshop',
    workshopSchema)

module.exports = WORKSHOP