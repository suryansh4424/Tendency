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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's tasks
    let todayTasks = await Task.find({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // If no tasks exist for today, copy yesterday's recurring tasks
    if (todayTasks.length === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayTasks = await Task.find({
        user: req.user._id,
        date: {
          $gte: yesterday,
          $lt: today
        },
        isRecurring: true
      });

      // Create new tasks for today based on yesterday's tasks
      const newTasks = await Promise.all(yesterdayTasks.map(async (task) => {
        const newTask = new Task({
          title: task.title,
          user: req.user._id,
          completed: false,
          date: new Date(),
          originalTask: task.originalTask || task._id,
          isRecurring: true
        });
        return newTask.save();
      }));

      todayTasks = newTasks;
    }

    // Get yesterday's tasks as well
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayTasks = await Task.find({
      user: req.user._id,
      date: {
        $gte: yesterday,
        $lt: today
      }
    });

    // Combine and send both days' tasks
    const allTasks = [...yesterdayTasks, ...todayTasks];
    res.json(allTasks);
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new task
exports.createTask = async (req, res) => {
  try {
    console.log('Create task request:', {
      body: req.body,
      user: req.user,
      isPro: req.user.isPro
    });

    const { title } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    // Count only today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTaskCount = await Task.countDocuments({
      user: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    console.log('Task count check:', {
      todayTaskCount,
      userIsPro: req.user.isPro,
      maxAllowed: req.user.isPro ? 10 : 3
    });

    // Check task limit based on user status
    const maxTasks = req.user.isPro ? 10 : 3;
    if (todayTaskCount >= maxTasks) {
      const message = req.user.isPro 
        ? 'Premium users can only create up to 10 tasks per day'
        : 'Free users can only create up to 3 tasks per day. Upgrade to Premium for up to 10 tasks!';
      
      return res.status(403).json({ message });
    }

    const task = new Task({
      title: title.trim(),
      user: req.user._id,
      date: req.body.date || new Date(),
      isRecurring: req.body.isRecurring || false
    });

    const savedTask = await task.save();
    console.log('Task saved:', savedTask);
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
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow editing tasks from today or yesterday
    if (!isToday(task.date) && !isYesterday(task.date)) {
      return res.status(403).json({ message: 'Can only modify tasks from today or yesterday' });
    }

    task.title = req.body.title.trim();
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add this new controller function
exports.transferTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's recurring tasks
    const yesterdayTasks = await Task.find({
      user: req.user._id,
      date: {
        $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        $lt: today
      },
      isRecurring: true
    });

    // Create new tasks for today
    const newTasks = await Promise.all(yesterdayTasks.map(async (task) => {
      const newTask = new Task({
        title: task.title,
        user: req.user._id,
        completed: false,
        date: new Date(),
        originalTask: task.originalTask || task._id,
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
