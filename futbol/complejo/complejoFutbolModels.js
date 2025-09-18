const mongoose = require("mongoose");

const complejoSchema = new mongoose.Schema(
    {

        id_institucion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "instituciones",
        },

        direccion: { type: String },
        comuna: { type: String },
        zona_comuna: { type: String },

        id_espacio: [
            { type: mongoose.Schema.Types.ObjectId, ref: "espacios" },
        ],
        id_admin: [
            { type: mongoose.Schema.Types.ObjectId, ref: "usuarios" },
        ],
        deporte: { type: String },
        id_reserva: [
            { type: mongoose.Schema.Types.ObjectId, ref: "reservas" },
        ],
    },

    { timestamps: true }
);

module.exports = complejoSchema;