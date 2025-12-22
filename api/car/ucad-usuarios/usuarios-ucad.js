const mongoose = require("mongoose");

const usuariosUcadSchema = new mongoose.Schema({
  nombre: { type: String },
  apellido: { type: String },
  email: { type: String },
  password: [{ type: String }],
  rol: { type: String, enum: ['admin', 'profesional', 'deportista', 'colaborador'] },
  rut: { type: String },
  telefono: { type: String },
  direccion: { type: String },
  imgUrl: { type: String },
  fechaNacimiento: { type: Date },
  sexo: { type: String },
  comuna: { type: String },
  region: { type: String },
  estadoValidacion: { type: String, enum: ['pendiente', 'validado', 'rechazado'], default: 'validado' },
  especialidad: { type: String },
  agenda: { type: mongoose.Types.ObjectId, ref: 'agendaUCAD' },
  logged: { type: Boolean, default: false },
},{
    timestamps: true,
});

module.exports = mongoose.model("usuariosUcad", usuariosUcadSchema);
