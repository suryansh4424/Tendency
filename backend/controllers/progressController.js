const Progress = require('../models/Progress');

// Get progress for a user
exports.getProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.user.id });
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update progress when a task is completed
exports.updateProgress = async (req, res) => {
    try {
        const { taskId, date, completionLevel } = req.body;
        let progress = await Progress.findOne({ userId: req.user.id, taskId, date });

        if (progress) {
            progress.completionLevel = completionLevel;
            await progress.save();
        } else {
            progress = new Progress({ userId: req.user.id, taskId, date, completionLevel });
            await progress.save();
        }

        res.status(201).json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
