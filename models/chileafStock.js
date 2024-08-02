const mongoose = require('mongoose')


const chileafStockSchema = new mongoose.Schema({
    hubId: {type: Number},
    bleMac: {type: String},
    bleName: {type: String}
})

const ChileafStock = mongoose.model('ChileafStock', chileafStockSchema, 'chileafStock');

module.exports = ChileafStock;