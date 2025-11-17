const mongoose = require('mongoose');

const gestionPlanesNSchema = new mongoose.Schema({
    tipo: { type: String, required: true,
        enum: ['curso', 'nadoLibre', 'gimnasio', 'cursoTemporada']
     },
    nombrePlan: { type: String },
    variantesPlan: [{ type: mongoose.Types.ObjectId, ref: 'variantesPlanes' }],
    valor: { type: Number },
    institucion: { type: mongoose.Types.ObjectId, ref: 'institucion', required: true },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
    status: { type: Boolean, default: true },
},
{
    timestamps: true
});

const GestionPlanesN = mongoose.model('gestionPlanesN', gestionPlanesNSchema);

module.exports = GestionPlanesN;
