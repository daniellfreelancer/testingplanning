const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  athlete: {type: mongoose.Types.ObjectId, ref:'student'},
  sportCategory: {type: mongoose.Types.ObjectId, ref:'workshop'},
  evaluationType: { type: String, required: true },
  date: { type: Date, required: true },
  place: { type: String, required: true },
  notes: { type: String },
  type: { type: String, required: true },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);