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
            ref: "Jugador",
        },
        evaluador: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Evaluador",
        },
    },
    {
        timestamps: true,
    }
);

evaScoutingSchema.index({ fecha_evaluacion: -1 });

module.exports = evaScoutingSchema;
