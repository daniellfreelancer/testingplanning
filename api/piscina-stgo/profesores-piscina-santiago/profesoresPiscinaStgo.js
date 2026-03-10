const mongoose = require('mongoose');

const profesoresPiscinaStgoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    rut: { type: String, required: true },
    direccion: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    sexo: { type: String, required: true },
    comuna: { type: String, required: true },
},{
    timestamps: true
});

const ProfesoresPiscinaStgo = mongoose.model('ProfesoresPiscinaStgo', profesoresPiscinaStgoSchema);

module.exports = ProfesoresPiscinaStgo;