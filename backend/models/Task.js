const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  originalTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  isRecurring: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Task', taskSchema);
