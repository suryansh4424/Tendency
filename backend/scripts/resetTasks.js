require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');

async function resetTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing tasks
    await Task.deleteMany({});
    console.log('All tasks deleted');

    // Drop indexes and recreate them
    await Task.collection.dropIndexes();
    console.log('Indexes dropped');

    // Recreate indexes
    await Task.collection.createIndex({ user: 1, date: 1 });
    await Task.collection.createIndex({ user: 1 });
    await Task.collection.createIndex({ date: 1 });
    
    console.log('Indexes recreated');
    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetTasks(); 