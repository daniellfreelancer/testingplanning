const mongoose = require('mongoose');

const eventosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String,  },
    descripcion: { type: String,},
    horarioInicio: { type: String, required: false },
    horarioFin: { type: String, required: false },
    fechaInicio: { type: Date, required: false },
    fechaFin: { type: Date, required: false },
    lugar: { type: String, required: false },
    direccion: { type: String, required: false },
    capacidad: { type: Number, required: false },
    status: { type: Boolean, default: true },
    destacado: { type: Boolean, default: false },
    creadoPor: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' },
    imgUrl: { type: String, required: false },
    variantes: [{ type: mongoose.Types.ObjectId, ref: 'eventosVariantesPteAlto' }],

    // Campo para eventos externos
    linkExterno: { type: String, required: false },
    esEventoExterno: { type: Boolean, default: false },

},
{
    timestamps: true
});


const EventosPteAlto = mongoose.model('eventosPteAlto', eventosPteAltoSchema);

module.exports = EventosPteAlto;