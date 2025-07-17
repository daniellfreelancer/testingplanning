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
  institucion: [{ type: mongoose.Types.ObjectId, ref: 'institucion' }],
  centroDeportivo: [{ type: mongoose.Types.ObjectId, ref: 'centroDeportivo' }],
  admins: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
  usuarios: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
  profesores: [{ type: mongoose.Types.ObjectId, ref: 'usuario' }],
  talleres: [{ type: mongoose.Types.ObjectId, ref: 'talleres' }],
  status: { type: Boolean },
  deporte: { type: String },
  horarios: [{ type: String }],
  pago: {type: Boolean},
  valor: {type: Number},
  capacidad: {type: Number},

},{
    timestamps: true
});

const EspaciosDeportivos = mongoose.model("espacioDeportivo", espaciosDeportivosSchema);

module.exports = EspaciosDeportivos;    