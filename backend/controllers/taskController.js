const Task = require('../models/Task');

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    console.log('Fetching tasks for user:', req.user._id);
    const tasks = await Task.find({ user: req.user._id }).sort({ date: -1 });
    console.log('Found tasks:', tasks);
    res.json(tasks);
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new task
exports.createTask = async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Debug log
    const { title } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    // Count user's tasks
    const taskCount = await Task.countDocuments({ user: req.user._id });
    console.log('Current task count:', taskCount); // Debug log
    
    if (!req.user.isPro && taskCount >= 7) {
      return res.status(403).json({ message: 'Free users can only create up to 7 tasks' });
    }

    const task = new Task({
      title: title.trim(),
      user: req.user._id
    });

    const savedTask = await task.save();
    console.log('Saved task:', savedTask); // Debug log
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error in createTask:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};

// Toggle task completion
exports.toggleTask = async (req, res) => {
  try {
    console.log('Toggling task:', req.params.id);
    const task = await Task.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });

    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    task.completed = !task.completed;
    const updatedTask = await task.save();
    console.log('Task updated:', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error in toggleTask:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.title = title.trim();
    const updatedTask = await task.save();
    
    console.log('Task updated:', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(400).json({ message: error.message });
  }
};
