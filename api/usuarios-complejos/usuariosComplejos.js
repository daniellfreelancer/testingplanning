const mongoose = require("mongoose");

const usuariosComplejosSchema = new mongoose.Schema({
  nombre: { type: String},
  apellido: { type: String},
  email: { type: String},
  password: [{ type: String}],
  rol: { type: String},
  status: { type: Boolean },
  rut: { type: String},
  telefono: { type: String },
  institucion: [{ type: mongoose.Types.ObjectId, ref: 'institucion' }],
  centroDeportivo: [{ type: mongoose.Types.ObjectId, ref: 'centroDeportivo' }],
  espacioDeportivo: [{ type: mongoose.Types.ObjectId, ref: 'espacioDeportivo' }],
  taller: { type: mongoose.Types.ObjectId, ref: 'talleres' },
  misreservas: [{ type: mongoose.Types.ObjectId, ref: 'reservas' }],
  logeado: { type: Boolean, default: false },


},{
    timestamps: true
});

const UsuariosComplejos = mongoose.model("usuariosComplejos", usuariosComplejosSchema);

module.exports = UsuariosComplejos;