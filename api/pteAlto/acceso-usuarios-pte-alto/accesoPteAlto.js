const mongoose = require("mongoose");

const accesoPteAltoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Types.ObjectId, ref: "usuariosPteAlto" },
    usuarioAutorizado: { type: mongoose.Types.ObjectId, ref: "usuariosPteAlto" },
    institucion: { type: mongoose.Types.ObjectId, ref: "institucion" },
    fecha: { type: Date, default: Date.now },
    accesoLugar: { type: String },
    accesoTipo: { type: String },

},
{
    timestamps: true
});

const AccesoPteAlto = mongoose.model("accesoPteAlto", accesoPteAltoSchema);

module.exports = AccesoPteAlto;