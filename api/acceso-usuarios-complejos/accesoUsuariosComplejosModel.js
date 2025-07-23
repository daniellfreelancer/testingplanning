const mongoose = require('mongoose');

const accesoUsuariosComplejosSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuariosComplejos',
    },
    usuarioAutorizado:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuariosComplejos',
    },
    institucion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'institucion',
    },
    accesoLugar:{
        type: String,

    },
    accesoTipo:{
        type: String,
    },
},{
    timestamps: true,
});

const AccesoUsuariosComplejos = mongoose.model('accesoUsuariosComplejos', accesoUsuariosComplejosSchema);

module.exports = AccesoUsuariosComplejos;