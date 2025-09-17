const mongoose = require("mongoose");

const institucionSchema = new mongoose.Schema({
  nombre: { type: String },
  telefono: { type: String },
  status: { type: Boolean, default: true },
}, {
    timestamps: true
});

module.exports = institucionSchema;