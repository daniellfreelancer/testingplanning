const mongoose = require("mongoose");

const complejosSchema = new mongoose.Schema({
  nombre: { type: String },
  descripcion: { type: String },
  imgUrl: { type: String },
  direccion: { type: String },
  telefono: { type: String },
  email: { type: String },
  rut: { type: String },
  ciudad: { type: String },
  comuna: { type: String },
  status: { type: Boolean, default: true },
  espaciosDeportivos: [{ type: mongoose.Types.ObjectId, ref:'espacioDeportivo' }],
  centrosDeportivos: [{ type: mongoose.Types.ObjectId, ref:'centroDeportivo' }],
  admins: [{ type: mongoose.Types.ObjectId, ref:'usuariosComplejos' }],
  director:[{type: mongoose.Types.ObjectId, ref:'usuario'}],
  adminsOficina:[{type: mongoose.Types.ObjectId, ref:'usuario'}],
  usuarios: [{ type: mongoose.Types.ObjectId, ref:'usuariosComplejos' }],
  profesores: [{ type: mongoose.Types.ObjectId, ref:'usuario' }],

}, {
    timestamps: true
});

const Complejos = mongoose.model("institucion", complejosSchema);

module.exports = Complejos;