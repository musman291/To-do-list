const mongoose = require('mongoose');

const TimetableTaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // frontend-generated ID
  day: { type: String, required: true }, // Day of the week
  name: { type: String, required: true },
  time: { type: String, required: true }, // HH:MM
  desc: { type: String },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('TimetableTask', TimetableTaskSchema);
