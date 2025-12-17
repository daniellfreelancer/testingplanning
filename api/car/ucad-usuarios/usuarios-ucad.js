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
  estadoValidacion: { type: String, enum: ['pendiente', 'validado', 'rechazado'], default: 'pendiente' },
  especialidad: { type: String },
  logged: { type: Boolean, default: false },
},{
    timestamps: true,
});

module.exports = mongoose.model("usuariosUcad", usuariosUcadSchema);

usuariosUcadSchema.index({ email: 1 }, { unique: true });
usuariosUcadSchema.index({ rut: 1 }, { unique: true });
usuariosUcadSchema.index({ telefono: 1 }, { unique: true });
usuariosUcadSchema.index({ estadoValidacion: 1 });
usuariosUcadSchema.index({ especialidad: 1 });
usuariosUcadSchema.index({ rol: 1 });
usuariosUcadSchema.index({ fechaNacimiento: 1 });
usuariosUcadSchema.index({ sexo: 1 });
usuariosUcadSchema.index({ comuna: 1 });
usuariosUcadSchema.index({ region: 1 });
usuariosUcadSchema.index({ direccion: 1 });
usuariosUcadSchema.index({ imgUrl: 1 });
usuariosUcadSchema.index({ fechaRegistro: 1 });
