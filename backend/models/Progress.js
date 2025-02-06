const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    completionLevel: { type: Number, min: 1, max: 7, default: 1 } // 1 to 7 based on tasks completed
});

module.exports = mongoose.model('Progress', ProgressSchema);
