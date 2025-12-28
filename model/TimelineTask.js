const mongoose = require('mongoose');

const TimelineTaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // frontend-generated ID
  name: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true },
  desc: { type: String },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('TimelineTask', TimelineTaskSchema);
