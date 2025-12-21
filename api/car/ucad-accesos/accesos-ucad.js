const mongoose = require("mongoose");

const accesosUcadSchema = new mongoose.Schema(
  {
    // usuario que intenta/realiza el acceso
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usuariosUcad",
      required: true,
      index: true,
    },

    // usuario que autoriza (opcional)
    usuarioAutorizado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "usuariosUcad",
      default: null,
      index: true,
    },

    // si UCAD tiene institución / sede / centro, puedes usar esto (opcional)
    institucion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "institucion", // ajusta si tu modelo se llama distinto o no existe
      default: null,
      index: true,
    },

    // lugar/recurso al que se accede (ej: "agenda", "citas", "dashboard", "admin", "box-3", etc.)
    accesoLugar: { type: String, default: "", trim: true },

    // tipo de acceso (ej: "login", "crear_cita", "ver_historial", "admin", etc.)
    accesoTipo: { type: String, default: "", trim: true },

    // resultado del acceso (opcional pero útil)
    resultado: {
      type: String,
      enum: ["permitido", "denegado"],
      default: "permitido",
      index: true,
    },

    // motivo si fue denegado (opcional)
    motivo: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

accesosUcadSchema.index({ createdAt: -1 });

const AccesosUcad = mongoose.model("accesosUcad", accesosUcadSchema);
module.exports = AccesosUcad;
