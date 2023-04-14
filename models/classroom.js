const mongoose = require('mongoose')


const classroomSchema = new mongoose.Schema({
    grade:{type: String},
    level:{type: String},
    section:{type: String},
    teacher:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teacherSubstitute:[{type: mongoose.Types.ObjectId, ref:'user'}],
    students:[{type: mongoose.Types.ObjectId, ref:'student'}],
    planner: [{type: mongoose.Types.ObjectId, ref:'planner'}],
    classHistory:[{type: mongoose.Types.ObjectId, ref:'classhistory'}]

})

const CLASSROOM = mongoose.model(
    'classroom',
    classroomSchema)

module.exports = CLASSROOM