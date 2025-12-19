const mongoose = require("mongoose");

const NotificacionUcadSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsuariosUcad",
            required: true,
            index: true,
        },

        target: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsuariosUcad",
            required: true,
            index: true,
        },

        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },

        motivo: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },

        prioridad: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        tipo: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model(
    "NotificacionUcad",
    NotificacionUcadSchema,
    "notificacionesucads"
);
