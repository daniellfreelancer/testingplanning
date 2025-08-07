const mongoose = require("mongoose");

const centrosDeportivosSchema = new mongoose.Schema({
  nombre: { type: String },
  descripcion: { type: String },
  imgUrl: { type: String },
  direccion: { type: String },
  telefono: { type: Number },
  email: { type: String },
  rut: { type: String },
  ciudad: { type: String },
  comuna: { type: String },
  institucion: [{ type: mongoose.Types.ObjectId, ref: 'institucion' }],
  espaciosDeportivos: [{ type: mongoose.Types.ObjectId, ref: 'espacioDeportivo' }],
  admins: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
  usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
  profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
  director:[{type: mongoose.Types.ObjectId, ref:'usuariosComplejos'}],
  adminsOficina:[{type: mongoose.Types.ObjectId, ref:'usuariosComplejos'}],
  talleres: [{ type: mongoose.Types.ObjectId, ref: 'talleres' }],
  horarios: { type: Array }, // horarios de apertura y cierre del centro deportivo para luego limitar la validacion de horarios de los espacios deportivos
  status: { type: Boolean, default: true },
},{
    timestamps: true
});

const CentrosDeportivos = mongoose.model("centroDeportivo", centrosDeportivosSchema);

module.exports = CentrosDeportivos;