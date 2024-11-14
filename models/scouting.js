const mongoose = require('mongoose')


const scoutingSchema = new mongoose.Schema({
    sportCategory: { type: mongoose.Types.ObjectId, ref: 'sportCategory', required: false },
    club:{ type: mongoose.Types.ObjectId, ref: 'club', required: false },
    teacher: { type: mongoose.Types.ObjectId, ref: 'user', required: false },
    student: { type: mongoose.Types.ObjectId, ref:'student', required: true },
    scouting: { type: Array, required: true }
},{
    timestamps: true,
})

const SCOUTING = mongoose.model('scouting', scoutingSchema)

module.exports = SCOUTING