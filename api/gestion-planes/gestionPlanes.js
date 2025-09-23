const mongoose = require('mongoose');

const gestionPlanesSchema = new mongoose.Schema({
    tipo: { type: String, required: true,
        enum: ['curso', 'nadoLibre', 'gimnasio']
     },
    tipoPlan: { type: String, required: true },
    plan: { type: String, required: true },
    tieneVariante: { type: Boolean, required: true },
    variante:{ type: Object },
    dias: { type: Array, },
    horarios: { type: Array,},
    valor: { type: Number, required: true },
    institucion: { type: mongoose.Types.ObjectId, ref: 'institucion', required: true },
    usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
    status: { type: Boolean, default: true },
},{
    timestamps: true
})

const GestionPlanes = mongoose.model('gestionPlanes', gestionPlanesSchema);

module.exports = GestionPlanes


/**
 * tipo: 'curso',
 * tipoPlan: 'Matronatación',
 * plan: '2 veces por semana',
 * tieneVariante: true,
 * variante:{
 *  nombre:'Sabado',
 *  dias:['Sabado'],
 *  horarios:['09:00']},
 * dias:null,
 * horarios:null,
 * valor: 35000,
 * institucion: 'ObjectId',
 * usuarios: ['ObjectId1','ObjectId2'],
 * status: true
 */

/**
 * tipo:"curso",
 * tipoPlan:"Curso adulto 1",
 * plan:'1 vez por semana',
 * tieneVariante:false,
 * variante:null,
 * dias:['sabado'],
 * horarios:['13:00'],
 * valor:30000,
 * institucion:"ObjectId",
 * usuarios:[],
 * status:true
 */