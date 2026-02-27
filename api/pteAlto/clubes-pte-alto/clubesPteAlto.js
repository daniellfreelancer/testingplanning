const mongoose = require('mongoose');

/**
 * la figura clubes en puente alto es un PJ (Persona juridica), la cual tiene una ficha completa con sus datos, contacto, responsables, sedes, espacios deportivos, talleres, eventos, etc.
 */

const clubesPteAltoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    rut: { type: String, required: true },
    imgUrl: { type: String, },
    direccion: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true },    
    comuna: { type: String, required: true },
    region: { type: String, required: true },
    sedes: [{ type: mongoose.Types.ObjectId, ref: 'sedesDeportivasPteAlto' }],
    espaciosDeportivos: [{ type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' }],
    talleres: [{ type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto' }],
    eventos: [{ type: mongoose.Types.ObjectId, ref: 'eventosPteAlto' }],
    status: { type: Boolean, default: true },
    creadoPor: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' },
    responsable:[{type: Object}], //array de objetos con los datos del responsable del club
    contacto:[{type: Object}], //array de objetos con los datos del contacto del club
    documentos: [{ type: String }], // array de URLs de documentos del club (pdf, imágenes, etc.). Máximo 10.
    notas:{type: String}, //notas del club
    personaJuridica: { type: Boolean, default: false },

});

const ClubesPteAlto = mongoose.model('clubesPteAlto', clubesPteAltoSchema);

module.exports = ClubesPteAlto;