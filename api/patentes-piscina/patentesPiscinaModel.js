const mongoose = require("mongoose");

const patentesPiscinaSchema = new mongoose.Schema(
  {
    institucion: { type: mongoose.Types.ObjectId, ref: "institucion", required: true },
    usuario: { type: mongoose.Types.ObjectId, ref: "usuariosComplejos" },

    // Datos personales
    tipoRut: { type: String },
    rut: { type: String, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    correo: { type: String, required: true },
    telefono: { type: String },

    // Tipo de usuario y asistencia
    tipoUsuario: { type: String }, // 'individual' | 'institucion'
    institucionNombre: { type: String },
    diasAsistencia: [{ type: String }],
    contrato: { type: String }, // número de ficha (ej. 20250226-143022)

    // Datos del vehículo
    tipoVehiculo: { type: String }, // 'automovil' | 'moto'
    marcaVehiculo: { type: String },
    marcaVehiculoOtro: { type: String },
    patente: { type: String, required: true },

    autorizacionDatos: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PatentesPiscina = mongoose.model("patentesPiscina", patentesPiscinaSchema);
module.exports = PatentesPiscina;
