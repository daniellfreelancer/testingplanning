const mongoose = require("mongoose");

const usuariosComplejosSchema = new mongoose.Schema({
  nombre: { type: String},
  apellido: { type: String},
  email: { type: String},
  correo: { type: String},
  password: [{ type: String}],
  rol: { type: String},
  status: { type: Boolean, default: true },
  tipoRut: { type: String},
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
  fecha_nacimiento: { type: Date },
  sexo: { type: String },
  fechaRegistro: { type: Date, default: Date.now }, // Fecha de registro
  direccion: { type: String }, // Dirección
  numeroDireccion: { type: String }, // Número de la dirección
  padecePatologia: { type: Boolean }, // ¿Padece alguna patología física?
  descripcionPatologia: { type: String }, // Indique cuál patología
  ultimaActividadFisica: { type: String }, // Última vez que realizó actividad física
  neurodivergente: { type: Boolean }, // ¿Condición neurodivergente?
  descripcionNeurodivergencia: { type: String }, // Indique cuál condición
  objetivoIngreso: { type: String }, // Objetivo por el cuál ingresa
  usaMedicamentos: { type: Boolean }, // Indique si toma algún medicamento
  medicamentosDetalle: { type: String }, // Indique cuáles medicamentos
  esAlergico: { type: Boolean }, // Indique si tiene alguna alergia
  alergiasDetalle: { type: String }, // Indique cuáles alergias
  cirugiasRecientes: { type: Boolean }, // ¿Ha tenido alguna cirugía?
  cirugiasDetalle: { type: String }, // Indique cuál cirugía
  prevencionSalud: { type: String }, // Indique cuál prevision
  isapreNombre: { type: String }, // Indique cuál prevision
  convenioEmergencia: { type: Boolean}, // Indique cuál convenio de emergencia
  convenioDetalle: { type: String }, // Indique cuál convenio de emergencia
 contactoEmergencia: {
    nombres: { type: String },
    apellidos: { type: String },
    parentesco: { type: String },
    telefono: { type: String }
  },
  esResponsable:{type: Boolean},
  responsableMenorEdadNombre: { type: String },
  responsableMenorEdadApellido: { type: String },
  responsableMenorEdadRut: { type: String },
  responsableMenorEdadParentesco: { type: String },
  responsableMenorEdadTelefono: { type: String },
  responsableMenorEdadDireccion: { type: String },
  responsableMenorEdadNumeroDireccion: { type: String },
  responsableMenorEdadComuna: { type: String },
  tipoPlan: { type: String }, // Tipo de plan
  tipoPlanGym: { type: String }, // Tipo de plan de gimnasio
  bloqueHorario: { type: String }, // Bloque horario
  fotoCedulaFrontal: { type: String }, // URL/path foto cédula frontal
  fotoCedulaReverso: { type: String }, // URL/path foto cédula reverso
  firma: { type: String }, // Firma electrónica (URL/base64)
  declaracionSalud: { type: Boolean }, // Declaración de salud compatible
  aceptacionReglamento: { type: Boolean }, // Aceptación de reglamento
  autorizacionDatos: { type: Boolean }, // Autorización tratamiento de datos
  // Pendiente cambiar entrenador a Array de objetos
  entrenador: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }], 
  alumnos: [{ type: mongoose.Types.ObjectId, ref: 'usuariosComplejos' }],
  resideEnSantiago: { type: Boolean },
  
  //campos para formulario evaluacion -> formulario inicial
  evaluado: {type: Boolean, default: false},
  tipoCurso: {type: String},
  fechaEvaluacion: {type: Date},
  suscripcion_activa: {type: Boolean},
  //campos para formulario contratacion -> actualizacion de datos
  beneficioPiscina: {type: Boolean},
  trabajadorPiscina: {type: String},
  tipoContratacion: {type: String},
  nivelCurso: {type: String},
  tipoPlan: {type: String},
  tutores:[{type: Object}],
  tipoDomicilio:{type: String},
  salvavidas:{type: Object},
  arrendatario:{type: Boolean},
  nombreArrendatario:{type: String},

},{
    timestamps: true
});


const UsuariosComplejos = mongoose.model("usuariosComplejos", usuariosComplejosSchema);

module.exports = UsuariosComplejos;