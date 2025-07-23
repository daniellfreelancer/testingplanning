const mongoose = require("mongoose");

const usuariosComplejosSchema = new mongoose.Schema({
  nombre: { type: String},
  apellido: { type: String},
  email: { type: String},
  password: [{ type: String}],
  rol: { type: String},
  status: { type: Boolean, default: true },
  rut: { type: String},
  telefono: { type: String },
  institucion: [{ type: mongoose.Types.ObjectId, ref: 'institucion' }],
  centroDeportivo: [{ type: mongoose.Types.ObjectId, ref: 'centroDeportivo' }],
  espacioDeportivo: [{ type: mongoose.Types.ObjectId, ref: 'espacioDeportivo' }],
  taller: { type: mongoose.Types.ObjectId, ref: 'talleres' },
  misreservas: [{ type: mongoose.Types.ObjectId, ref: 'reservas' }],
  logeado: { type: Boolean, default: false },

  //campos para usuarios de piscinas - Campos adicionales del formulario de gimnasio
  comuna: { type: String },
  fechaNacimiento: { type: Date },
  sexo: { type: String },
  fechaRegistro: { type: Date, default: Date.now }, // Fecha de registro
  direccion: { type: String }, // Dirección
  numeroDireccion: { type: String }, // Número de la dirección
  padecePatologia: { type: Boolean }, // ¿Padece alguna patología física?
  descripcionPatologia: { type: String }, // Indique cuál patología
  ultimaActividadFisica: { type: String }, // Última vez que realizó actividad física
  neurodivergente: { type: Boolean }, // ¿Condición neurodivergente?
  descripcionNeurodivergente: { type: String }, // Indique cuál condición
  objetivoIngreso: { type: String }, // Objetivo por el cuál ingresa
  contactoEmergencia: {
    nombres: { type: String },
    apellidos: { type: String },
    parentesco: { type: String },
    telefono: { type: String }
  },
  tipoPlan: { type: mongoose.Types.ObjectId, ref: 'talleres' }, // Tipo de plan
  bloqueHorario: { type: String }, // Bloque horario
  fotoCedulaFrontal: { type: String }, // URL/path foto cédula frontal
  fotoCedulaReverso: { type: String }, // URL/path foto cédula reverso
  firma: { type: String }, // Firma electrónica (URL/base64)
  declaracionSalud: { type: Boolean }, // Declaración de salud compatible
  aceptacionReglamento: { type: Boolean }, // Aceptación de reglamento
  autorizacionDatos: { type: Boolean }, // Autorización tratamiento de datos

},{
    timestamps: true
});

const UsuariosComplejos = mongoose.model("usuariosComplejos", usuariosComplejosSchema);

module.exports = UsuariosComplejos;