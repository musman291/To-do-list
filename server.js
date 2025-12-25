// -----------------------------
// server.js
// -----------------------------

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Task = require('./model/Task');              // Routine tasks
const TimelineTask = require('./model/TimelineTask'); // Timeline tasks

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// -----------------------------
// Connect to MongoDB
// -----------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// -----------------------------
// ROUTES
// -----------------------------

// ----- Routine Tasks -----

// Get all routine tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update routine task
app.post('/tasks', async (req, res) => {
  try {
    const { id, day, name, time, desc, completed } = req.body;

    let task = await Task.findOne({ id });
    if (task) {
      task.day = day;
      task.name = name;
      task.time = time;
      task.desc = desc;
      task.completed = completed ?? task.completed;
    } else {
      task = new Task({ id, day, name, time, desc, completed });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete routine task
app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Routine task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Timeline Tasks -----

// Get all timeline tasks
app.get('/timeline-tasks', async (req, res) => {
  try {
    const tasks = await TimelineTask.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update timeline task
app.post('/timeline-tasks', async (req, res) => {
  try {
    const { id, name, date, time, desc, completed } = req.body;

    let task = await TimelineTask.findOne({ id });
    if (task) {
      task.name = name;
      task.date = date;
      task.time = time;
      task.desc = desc;
      task.completed = completed ?? task.completed;
    } else {
      task = new TimelineTask({ id, name, date, time, desc, completed });
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete timeline task
app.delete('/timeline-tasks/:id', async (req, res) => {
  try {
    await TimelineTask.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Timeline task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
