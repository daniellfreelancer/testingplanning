const mongoose = require('mongoose');

const reservasPteAltoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' },
    taller: { type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto' },
    espacioDeportivo: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' },
    sede: { type: mongoose.Types.ObjectId, ref: 'sedesDeportivasPteAlto' },
    club: { type: mongoose.Types.ObjectId, ref: 'clubesPteAlto' },
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
    tipoReservaInterna: { type: String, enum: ['tercero', 'convenio', 'cliente', 'arrendatario', 'mantenimiento', 'usuario'], default: 'usuario' },
    reservadoPor: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' }, // Usuario admin que crea la reserva
    reservadoPara: { type: String }, // Descripción o nombre de para quién es la reserva (tercero, convenio, cliente, etc.)
    notas: { type: String },
    canceladoPor: { type: String},
}, {
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