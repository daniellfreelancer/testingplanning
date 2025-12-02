const mongoose = require('mongoose');

const reservasPteAltoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' },
    taller: { type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto' },
    espacioDeportivo: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' },
    status: { type: Boolean },
    dia: { type: String },
    hora: { type: String },
    mes: { type: String },
    anio: { type: String },
    fechaInicio: { type: Date },
    fechaFin: { type: Date },
    estado: { type: String, enum: ['activa', 'cancelada'], default: 'activa' },
    tipoReserva: { type: String, enum: ['espacio', 'taller'], required: true },
    esReservaInterna: { type: Boolean, default: false },
    notas: { type: String },
    canceladoPor: { type: String, enum: ['USER', 'ADMIN', 'SYSTEM'] },
},{
    timestamps: true,
    
});

// Índices para mejorar performance de consultas
reservasPteAltoSchema.index({ espacioDeportivo: 1, fechaInicio: 1, fechaFin: 1 });
reservasPteAltoSchema.index({ taller: 1 });
reservasPteAltoSchema.index({ usuario: 1 });
reservasPteAltoSchema.index({ estado: 1 });
reservasPteAltoSchema.index({ fechaInicio: 1 });
reservasPteAltoSchema.index({ tipoReserva: 1 });
reservasPteAltoSchema.index({ espacioDeportivo: 1, estado: 1 });


const ReservasPteAlto = mongoose.model('reservasPteAlto', reservasPteAltoSchema);

module.exports = ReservasPteAlto;