const mongoose = require("mongoose");

const boxesUcadSchema = new mongoose.Schema({
    nombre: { type: String },
    descripcion: { type: String },
    imgUrl: { type: String },
    estado: { type: String, enum: ['disponible', 'ocupado', 'mantencion'], default: 'disponible' },
    reservas: { type: Array, default: [] },
});

module.exports = mongoose.model("boxesUcad", boxesUcadSchema);