const mongoose = require("mongoose");
const evaScoutingSchema = new mongoose.Schema(
    {
        fecha_evaluacion: {
            type: Date,
            required: true,
        },
        calificaciones: [
            {
                type: Number,
                min: 0,
                max: 10,
            },
        ],
        evaluado: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Usuario", // jugador
        },
        evaluador: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Usuario", // evaluador
        },
    },
    {
        timestamps: true,
    }
);

evaScoutingSchema.index({ fecha_evaluacion: -1 });

module.exports = evaScoutingSchema;
