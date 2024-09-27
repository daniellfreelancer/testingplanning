const mongoose = require('mongoose')

const medicalRegister = new mongoose.Schema({

    user: { type: mongoose.Types.ObjectId, ref: 'user', required: false }, // Hace referencia a la colección "User"
    student: { type: mongoose.Types.ObjectId, ref: 'student', required: false }, // Hace referencia a la colección "Student"
    institution:{ type: mongoose.Types.ObjectId, ref: 'insti', required: false },
    medicalRecord01: { type: Object, required: false },
    medicalRecord02: { type: Object, required: false },
    medicalRecord03: { type: Object, required: false },
    medicalRecord04: { type: Object, required: false },
    medicalRecord05: { type: Object, required: false },
    medicalRecord06: { type: Object, required: false },
    medicalRecord07: { type: Object, required: false },
    medicalRecord08: { type: Object, required: false },
    medicalRecord09: { type: Object, required: false },
    medicalRecord10: { type: Object, required: false },
    medicalRecord11: { type: Object, required: false },
    medicalRecord12: { type: Object, required: false },
    medicalRecord13: { type: Object, required: false },
    medicalRecord14: { type: Object, required: false },
    medicalRecord15: { type: Object, required: false },
    medicalRecord16: { type: Object, required: false },
    medicalRecord17: { type: Object, required: false },
    medicalRecord18: { type: Object, required: false },
    medicalRecord19: { type: Object, required: false },
    medicalRecord20: { type: Object, required: false },
    medicalRecord21: { type: Object, required: false },
    medicalRecord22: { type: Object, required: false },
    medicalRecord23: { type: Object, required: false },
    medicalRecord24: { type: Object, required: false },
    medicalRecord25: { type: Object, required: false },
    medicalRecord26: { type: Object, required: false },
    medicalRecord27: { type: Object, required: false },
    medicalRecord28: { type: Object, required: false },
    medicalRecord29: { type: Object, required: false },
    medicalRecord30: { type: Object, required: false },
    medicalRecord31: { type: Object, required: false },
    medicalRecord32: { type: Object, required: false },
    medicalRecord33: { type: Object, required: false },
    medicalRecord34: { type: Object, required: false },
    medicalRecord35: { type: Object, required: false },
    medicalRecord36: { type: Object, required: false },
    medicalRecord37: { type: Object, required: false },
    medicalRecord38: { type: Object, required: false },
    medicalRecord39: { type: Object, required: false },
    medicalRecord40: { type: Object, required: false },
    medicalRecord41: { type: Object, required: false },
    medicalRecord42: { type: Object, required: false },
    medicalRecord43: { type: Object, required: false },
    medicalRecord44: { type: Object, required: false },
    medicalRecord45: { type: Object, required: false },
    medicalRecord46: { type: Object, required: false },
    medicalRecord47: { type: Object, required: false },
    medicalRecord48: { type: Object, required: false },
    medicalRecord49: { type: Object, required: false },
    medicalRecord50: { type: Object, required: false },
    registeredValues: { type: Array, },
    rut:{ type: String, },

},
{
    timestamps: true,
})

const MEDICALREGISTER = mongoose.model('MedicalRegister', medicalRegister)

module.exports = MEDICALREGISTER