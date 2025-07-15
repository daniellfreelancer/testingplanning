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
  institucion: { type: mongoose.Types.ObjectId, ref: 'institucion' },
  espaciosDeportivos: [{ type: mongoose.Types.ObjectId, ref: 'espacioDeportivo' }],
  admins: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
  usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
  profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
  director:[{type: mongoose.Types.ObjectId, ref:'usuario'}],
  adminsOficina:[{type: mongoose.Types.ObjectId, ref:'usuario'}],
  talleres: [{ type: mongoose.Types.ObjectId, ref: 'talleres' }],
  status: { type: Boolean, default: true },
},{
    timestamps: true
});

const CentrosDeportivos = mongoose.model("centroDeportivo", centrosDeportivosSchema);

module.exports = CentrosDeportivos;