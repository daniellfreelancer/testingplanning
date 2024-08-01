const mongoose = require('mongoose');

const vmDeviceSchema = new mongoose.Schema({
  _id: String,
  hubId: Number,
  bleMac: String,
  bleName: String,
  heartRate: Number,
  battery: Number,
  steps: Number,
  calories: Number,
  timestamp: Date
});

const VmDevice = mongoose.model('VmDevice', vmDeviceSchema, 'vmDevice');

module.exports = VmDevice;