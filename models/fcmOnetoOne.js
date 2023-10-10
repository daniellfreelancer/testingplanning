const mongoose = require('mongoose');


const fcmOneToOneSchema = new mongoose.Schema({
    user: {type: String},
    token:{type: String}
},
{
    timestamps: true,
})

const TOKENSONE = mongoose.model('tokenOneToOne', fcmOneToOneSchema);

module.exports = TOKENSONE;
