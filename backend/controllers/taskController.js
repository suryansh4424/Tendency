const Task = require('../models/Task');

// Add these helper functions at the top
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user._id.toString();
    console.log('User ID from token:', userId);
    console.log('Full user object:', req.user);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Add strict user filtering
    const tasks = await Task.find({
      user: userId,
      date: {
        $gte: yesterday,
        $lt: tomorrow
      }
    }).lean();

    // Double-check each task belongs to the user
    const userTasks = tasks.filter(task => task.user.toString() === userId);
    
    console.log(`Found ${userTasks.length} tasks for user ${userId}`);
    
    // Log some task details for debugging
    userTasks.forEach(task => {
      console.log(`Task: ${task._id}, User: ${task.user}, Title: ${task.title}`);
    });

    res.json(userTasks);
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new task
exports.createTask = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user._id.toString();
    console.log('Creating task for user:', userId);
    console.log('Full user object:', req.user);

    const { title } = req.body;
    
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Check for duplicate task in the last minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const existingTask = await Task.findOne({
      user: userId,
      title: title.trim(),
      createdAt: { $gt: oneMinuteAgo }
    });

    if (existingTask) {
      console.log('Duplicate task detected');
      return res.status(201).json(existingTask);
    }

    // Create new task with explicit user ID
    const task = new Task({
      title: title.trim(),
      user: userId,
      date: new Date(),
      isRecurring: req.body.isRecurring || false
    });

    const savedTask = await task.save();
    console.log(`New task created - ID: ${savedTask._id}, User: ${userId}, Title: ${savedTask.title}`);
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Toggle task completion
exports.toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow toggling tasks from today or yesterday
    if (!isToday(task.date) && !isYesterday(task.date)) {
      return res.status(403).json({ message: 'Can only modify tasks from today or yesterday' });
    }

    task.completed = !task.completed;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id // Strict user check
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log(`Task ${req.params.id} deleted by user ${req.user._id}`);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id // Strict user check
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Double-check ownership
    if (!task.belongsTo(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to modify this task' });
    }

    task.title = req.body.title.trim();
    const updatedTask = await task.save();
    
    console.log(`Task ${task._id} updated by user ${req.user._id}`);
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Add this new controller function
exports.transferTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only get recurring tasks from yesterday for this specific user
    const yesterdayTasks = await Task.find({
      user: req.user._id,
      date: {
        $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        $lt: today
      },
      isRecurring: true
    });

    // Don't create new tasks if there are already tasks for today
    const todayTasksExist = await Task.exists({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (todayTasksExist) {
      return res.json([]); // Return empty array if tasks already exist for today
    }

    // Create new tasks for today
    const newTasks = await Promise.all(yesterdayTasks.map(async (task) => {
      const newTask = new Task({
        title: task.title,
        user: req.user._id,
        completed: false,
        date: new Date(),
        isRecurring: true
      });
      return newTask.save();
    }));

    res.json(newTasks);
  } catch (error) {
    console.error('Error in transferTasks:', error);
    res.status(500).json({ message: error.message });
  }
};
