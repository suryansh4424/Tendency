require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');

async function cleanupOldTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Remove tasks older than 30 days
    const result = await Task.deleteMany({
      date: { $lt: thirtyDaysAgo }
    });

    console.log(`Deleted ${result.deletedCount} old tasks`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
}

cleanupOldTasks(); 