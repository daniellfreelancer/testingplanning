const mongoose = require('mongoose')

const instiDecentralized = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    rut: {type: String, required: true},
    logo: { type: String,  },
    type: { type: String,  },
    admins:[{type: mongoose.Types.ObjectId, ref:'user'}],
    director:[{type: mongoose.Types.ObjectId, ref:'user'}],
    adminsOffice:[{type: mongoose.Types.ObjectId, ref:'user'}],
    hubId: {type: Number, required: false},
    subscriptions: [{ type: String, required: false }],
    institution:[{type: mongoose.Types.ObjectId, ref:'insti'}]
},
{
    timestamps: true,
})

module.exports = mongoose.model('instiDecentralized', instiDecentralized)