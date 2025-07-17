const mongoose = require("mongoose");

const talleresSchema = new mongoose.Schema({
    nombre: { type: String },
    deporte: { type: String },
    pago: { type: Boolean },
    valor: { type: Number },
    capacidad: { type: Number },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
    profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
    centroDeportivo: { type: mongoose.Types.ObjectId, ref: 'centroDeportivo' },
    espacioDeportivo: { type: mongoose.Types.ObjectId, ref: 'espacioDeportivo' },
    admins: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
    status: { type: Boolean },
    reservaProgramada: [{ type: mongoose.Types.ObjectId, ref: 'reserva' }]
}, {
    timestamps: true
});

const Talleres = mongoose.model("talleres", talleresSchema);