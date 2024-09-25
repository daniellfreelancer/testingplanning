const mongoose = require('mongoose')

const medicalRegister = new mongoose.Schema({

    user: { type: mongoose.Types.ObjectId, ref: 'user', required: false }, // Hace referencia a la colección "User"
    student: { type: mongoose.Types.ObjectId, ref: 'student', required: false }, // Hace referencia a la colección "Student"
    institution:{ type: mongoose.Types.ObjectId, ref: 'insti', required: false },
    medicalRecord: { type: Number, },
    observation: { type: String, },
    recordName : { type: String, },
    rut:{ type: String, },

},
{
    timestamps: true,
})

const MEDICALREGISTER = mongoose.model('MedicalRegister', medicalRegister)

module.exports = MEDICALREGISTER