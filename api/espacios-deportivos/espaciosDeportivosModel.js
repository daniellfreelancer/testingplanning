const mongoose = require("mongoose");

const espaciosDeportivosSchema = new mongoose.Schema({
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
  centroDeportivo: { type: mongoose.Types.ObjectId, ref: 'centroDeportivo' },
  admins: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
  usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
  profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
  talleres: [{ type: mongoose.Types.ObjectId, ref: 'talleres' }],
  status: { type: Boolean, default: true },
  deporte: { type: String },
  horarios: { type: Array },
  pago: {type: Boolean},
  valor: {type: Number},
  capacidad: {type: Number},
  reservas: [{type: mongoose.Types.ObjectId, ref: 'reservas'}],

},{
    timestamps: true
});

const EspaciosDeportivos = mongoose.model("espacioDeportivo", espaciosDeportivosSchema);

module.exports = EspaciosDeportivos;    