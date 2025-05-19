const mongoose = require('mongoose')


const instiSchema = new mongoose.Schema({
    name:{type: String, required: true},
    admins:[{type: mongoose.Types.ObjectId, ref:'user'}],
    director:[{type: mongoose.Types.ObjectId, ref:'user'}],
    adminsOffice:[{type: mongoose.Types.ObjectId, ref:'user'}],
    teachers:[{type: mongoose.Types.ObjectId, ref:'user'}],
    schools:[{type: mongoose.Types.ObjectId, ref:'school'}],
    programs:[{type: mongoose.Types.ObjectId, ref:'program'}],
    clubs:[{type: mongoose.Types.ObjectId, ref:'club'}],
    students:[{type: mongoose.Types.ObjectId, ref:'student'}],
    address:{type: String, required: false},
    email: {type: String,required: false},
    phone: {type: String, required: false},
    rut: {type: String, required: false},
    hubId: {type: Number, required: false},
    subscriptions: [{ type: String, required: false }],
    type: {type: String, required: false},
    vmType:{type: String},
    institutionDecentralized: [{type: mongoose.Types.ObjectId, ref:'instiDecentralized'}],
    modules: {
        type: [String],
        required: false,
        default: ['baseVM'], 
        enum: [ 
            'baseVM', 
            'hrvBasico',
            'hrvAvanzado',
            'cargaInternaMF',
            'entrenamientoBandaBasico',
            'entrenamientoBandaAvanzado',
            'Hub',
            'vmClassEscuelas',
            'vmClassDeportivo',
            'medicionesFisicas',
            'reporteriaBasico',
            'reportiraAvanzado',
            'controlAsistencia',
            'adminComplejos',
            'facturacionCaja',
            'facturacionPagos',
            'facturacionMensualidad',
            'scoutingBasico',
            'scoutingAvanzado',
            'ligas',
            'agendamientosBasico',
            'agendamientosAvanzado',
            'eventos',
            'cuestionarios',
            'encuestas'
        ]
    }

},
{
    timestamps: true,
})

const INSTITUTION = mongoose.model(
    'insti',
    instiSchema
)

module.exports = INSTITUTION