const mongoose = require("mongoose");

const adminExternoSchema = new mongoose.Schema(
  {
    nombre: { type: String },
    apellido: { type: String },
    email: { type: String, required: true },
    password: [{ type: String }],
    rut: { type: String },
    rol: { type: String, default: "ADMIN_EXTERNO" },
    status: { type: Boolean, default: true },
    institucion: { type: mongoose.Types.ObjectId, ref: "institucion" },
    nombreArrendatario: { type: String },
    /** IDs de usuarios asignados a esta institución externa (ref: usuariosComplejos) */
    usuarios: { type: [{ type: mongoose.Types.ObjectId, ref: "usuariosComplejos" }], default: [] },
    /** Cantidad máxima de usuarios que este admin puede habilitar */
    cupos: { type: Number, default: 0 },
    /** Cantidad máxima de personas que puede registrar */
    limite: { type: Number, default: 0 },
    fechaRegistro: { type: Date, default: Date.now },
    from: { type: String },
  },
  { timestamps: true }
);

adminExternoSchema.index({ email: 1 });
adminExternoSchema.index({ rut: 1 });
adminExternoSchema.index({ institucion: 1 });

const AdminExterno = mongoose.model("adminExterno", adminExternoSchema);
module.exports = AdminExterno;
