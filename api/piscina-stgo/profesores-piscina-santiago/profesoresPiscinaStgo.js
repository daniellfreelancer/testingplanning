const mongoose = require('mongoose');

const profesoresPiscinaStgoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String,  },
    rut: { type: String, required: true },
    status: { type: Boolean, default: true },
    //campos no requeridos
    imgUrl: { type: String },
    documentos: { type: Array },
    idFront: { type: String },
    idBack: { type: String },
    backgroundDoc: { type: String },
    otherDocs: { type: String },
    controlParental: { type: Boolean },
    role: { type: String, default: 'TRAINER' }

},{
    timestamps: true
});

const ProfesoresPiscinaStgo = mongoose.model('profesoresPiscinaStgo', profesoresPiscinaStgoSchema);

module.exports = ProfesoresPiscinaStgo;