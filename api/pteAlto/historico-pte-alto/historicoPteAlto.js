const mongoose = require('mongoose');

const historicoPteAltoSchema = new mongoose.Schema({
    realizadoPor: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto', required: true },
    accionRealizada: { type: String, required: true },
    // Referencias opcionales según el tipo de entidad afectada
    historicoUsuario: { type: mongoose.Types.ObjectId, ref: 'usuariosPteAlto' },
    historicoComplejos: { type: mongoose.Types.ObjectId, ref: 'complejosDeportivosPteAlto' },
    historicoReservas: { type: mongoose.Types.ObjectId, ref: 'reservasPteAlto' },
    historicoClubes: { type: mongoose.Types.ObjectId, ref: 'clubesPteAlto' },
    historicoSedes: { type: mongoose.Types.ObjectId, ref: 'sedesDeportivasPteAlto' },
    historicoEspacios: { type: mongoose.Types.ObjectId, ref: 'espaciosDeportivosPteAlto' },
    historicoTalleres: { type: mongoose.Types.ObjectId, ref: 'talleresDeportivosPteAlto' },
    historicoEventos: { type: mongoose.Types.ObjectId, ref: 'eventosPteAlto' },
    historicoEventosVariantes: { type: mongoose.Types.ObjectId, ref: 'eventosVariantesPteAlto' },
    historicoNoticias: { type: mongoose.Types.ObjectId, ref: 'Noticia' },
    historicoAlbumes: { type: mongoose.Types.ObjectId, ref: 'Album' },
    historicoVideos: { type: mongoose.Types.ObjectId, ref: 'Video' },
    historicoAcceso: { type: mongoose.Types.ObjectId, ref: 'accesoPteAlto' },
}, {
    timestamps: true
});

const HistoricoPteAlto = mongoose.model('historicoPteAlto', historicoPteAltoSchema);

module.exports = HistoricoPteAlto;
