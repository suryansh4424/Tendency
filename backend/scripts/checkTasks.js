require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');

async function checkTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tasks = await Task.find({}).lean();
    
    console.log('\nAll tasks:');
    tasks.forEach(task => {
      console.log(`ID: ${task._id}, User: ${task.user}, Title: ${task.title}`);
    });

    const tasksWithoutUser = await Task.find({ user: { $exists: false } });
    console.log('\nTasks without user:', tasksWithoutUser.length);

    const uniqueUsers = [...new Set(tasks.map(t => t.user.toString()))];
    console.log('\nUnique users with tasks:', uniqueUsers);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTasks(); 