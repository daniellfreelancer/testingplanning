const mongoose = require("mongoose");

const justificacionScoutingSchema = new mongoose.Schema(
    {
        transporte: { type: String, trim: true, default: "" },
        comida: { type: String, trim: true, default: "" },
        hospedaje: { type: String, trim: true, default: "" },

        evaluador: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Usuario",
        },

        validado: [
            {
                type: Boolean,
                default: false
            }
        ]
    },
    { timestamps: true }
);

justificacionScoutingSchema.index({ evaluador: 1, createdAt: -1 });

module.exports = justificacionScoutingSchema;
