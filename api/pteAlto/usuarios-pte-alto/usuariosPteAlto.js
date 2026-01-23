const mongoose = require("mongoose");

const usuariosPteAltoSchema = new mongoose.Schema({
    nombre: { type: String },
    apellido: { type: String },
    email: { type: String },
    rut: { type: String },
    telefono: { type: String },
    direccion: { type: String }, // url de la direccion de google maps
    fechaNacimiento: { type: Date },
    sexo: { type: String },
    comuna: { type: String },
    ciudad: { type: String },
    region: { type: String },
    certificadoDomicilio: { type: String },
    password: [{ type: String }],
    rol: { type: String },
    status: { type: Boolean, default: false },
    institucion: { type: mongoose.Types.ObjectId, ref: 'institucion' },
    estadoValidacion: { type: String, enum: ['pendiente', 'validado', 'rechazado'], default: 'pendiente' },
},
{
    timestamps: true
});

const UsuariosPteAlto = mongoose.model("usuariosPteAlto", usuariosPteAltoSchema);

module.exports = UsuariosPteAlto;