const mongoose = require('mongoose')


const chileafStockSchema = new mongoose.Schema({
    hubId: {type: Number}, //31452
    bleMac: {type: String},
    bleName: {type: String} // vm837-0
})

const ChileafStock = mongoose.model('ChileafStock', chileafStockSchema, 'chileafStock');

module.exports = ChileafStock;