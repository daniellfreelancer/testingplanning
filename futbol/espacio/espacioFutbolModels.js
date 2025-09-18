const mongoose = require("mongoose");

const espacioSchema = new mongoose.Schema(
    {
        id_complejo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "complejo",
            required: true,
        },

        nombre: { type: String, required: true },
        capacidad: { type: Number },
        direccion: { type: String },

        id_deporte: [
            { type: mongoose.Schema.Types.ObjectId, ref: "deportes" },
        ],
        productos: [
            { type: mongoose.Schema.Types.ObjectId, ref: "productos" },
        ],

        status: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = espacioSchema;