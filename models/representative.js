const mongoose = require('mongoose');

const representativeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, },
    phone: { type: String,},
    address: { type: String, },
    city: { type: String,},
    rut: { type: String, required: true },
    children: [{ type: mongoose.Types.ObjectId, ref: 'student' }],
    password: [{ type: String }],
    logged: { type: String },
    role: { type: String },
    from: [{ type: String }],
    notifications: [{ type: mongoose.Types.ObjectId, ref: 'notification' }],
    imgUrl: { type: String },
    imgRekognition: { type: String },

},{
    timestamps: true,
});

const REPRESENTATIVE = mongoose.model('representative', representativeSchema);

module.exports = REPRESENTATIVE;