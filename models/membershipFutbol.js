const mongoose = require('mongoose')


const membershipFutbolSchema = new mongoose.Schema({
    student: { type: mongoose.Types.ObjectId, ref:'student' },
    year:{ type: String },
    futbolSchool: { type: mongoose.Types.ObjectId, ref:'program' },
    institution: { type: mongoose.Types.ObjectId, ref:'insti' },
    amount:{type: Number},
    statusMembership:{type:String},
    january:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    february:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    march:{
        status: { type: String },
        recipe: { type: String },
        payment: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    april:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    may:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    june:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    july:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    august:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    september:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    october:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    november:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },
    december:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: Number },
    },

},{
    timestamps: true,
})


const MEMBERSHIPFUTBOL = mongoose.model(
    'membershipfutbol',
    membershipFutbolSchema
)

module.exports = MEMBERSHIPFUTBOL