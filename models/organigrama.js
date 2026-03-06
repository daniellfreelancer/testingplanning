const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, default: 'default' },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    data: {
        label: { type: String, required: true },
        cargo: { type: String },
        email: { type: String },
        telefono: { type: String },
        departamento: { type: String },
        imgUrl: { type: String }
    },
    style: { type: mongoose.Schema.Types.Mixed }
}, { strict: false });

const edgeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    type: { type: String, default: 'default' },
    animated: { type: Boolean, default: false },
    style: { type: mongoose.Schema.Types.Mixed }
}, { strict: false });

const organigramaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    nodes: [nodeSchema],
    edges: [edgeSchema],
    institution: { type: mongoose.Types.ObjectId, ref: 'insti' },
    club: { type: mongoose.Types.ObjectId, ref: 'club' },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'user', required: false },
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 }
}, {
    timestamps: true
});

const ORGANIGRAMA = mongoose.model('organigrama', organigramaSchema);

module.exports = ORGANIGRAMA;
