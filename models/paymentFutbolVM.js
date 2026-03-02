const mongoose = require('mongoose');

const paymentFutbolVMSchema = new mongoose.Schema({
    student: { type: mongoose.Types.ObjectId, ref: 'student' },
    futbolSchool: { type: mongoose.Types.ObjectId, ref: 'program' },
    institution: { type: mongoose.Types.ObjectId, ref: 'insti' },
    description: { type: String },
    amount: { type: Number },
    year: { type: String },
    status: { type: String },
    recipe: { type: String },
    paymentType: { type: String },
    paymentDate: { type: String },
    paymentPrice: { type: Number },
    datePaymentMonth: { type: Date },
},
{
    timestamps: true,
});

const PAYMENTFUTBOLVM = mongoose.model('paymentFutbolVM', paymentFutbolVMSchema);

module.exports = PAYMENTFUTBOLVM;