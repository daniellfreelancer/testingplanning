const mongoose = require('mongoose');

const profesoresPiscinaStgoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String,  },
    rut: { type: String, required: true },
    status: { type: Boolean, default: true },
},{
    timestamps: true
});

const ProfesoresPiscinaStgo = mongoose.model('profesoresPiscinaStgo', profesoresPiscinaStgoSchema);

module.exports = ProfesoresPiscinaStgo;