require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');

async function resetCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all tasks instead of dropping database
    await Task.deleteMany({});
    console.log('All tasks deleted');

    // Drop existing indexes on Task collection
    await Task.collection.dropIndexes();
    console.log('Task indexes dropped');

    // Recreate indexes
    await Task.collection.createIndex({ user: 1, date: 1 });
    await Task.collection.createIndex({ user: 1 });
    await Task.collection.createIndex({ date: 1 });
    console.log('Task indexes recreated');

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetCollections(); 