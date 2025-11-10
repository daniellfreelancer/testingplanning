const mongoose = require("mongoose");

const usuariosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String },
    apellido: { type: String },
    email: { type: String },
    rut: { type: String },
    password: { type: String },
    rol: { type: String },
    status: { type: Boolean, default: true },
},
{
    timestamps: true
});

const UsuariosPteAlto = mongoose.model("usuariosPteAlto", usuariosPteAltoSchema);

module.exports = UsuariosPteAlto;