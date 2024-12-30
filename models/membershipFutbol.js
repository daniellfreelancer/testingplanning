const mongoose = require('mongoose')


const membershipFutbolSchema = new mongoose.Schema({
    student: { type: mongoose.Types.ObjectId, ref:'student' },
    year:{ type: String },
    club: { type: mongoose.Types.ObjectId, ref:'club' },
    institution: { type: mongoose.Types.ObjectId, ref:'insti' },
    amount:{type: Number},
    statusMembership:{type:String},
    january:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    february:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    march:{
        status: { type: String },
        recipe: { type: String },
        payment: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    april:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    may:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    june:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    july:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    august:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    september:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    october:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    november:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },
    december:{
        status: { type: String },
        recipe: { type: String },
        paymentType: { type: String },
        paymentDate: { type: String },
        paymentPrice: { type: String },
    },

},{
    timestamps: true,
})


const MEMBERSHIPFUTBOL = mongoose.model(
    'membershipfutbol',
    membershipFutbolSchema
)

module.exports = MEMBERSHIPFUTBOL