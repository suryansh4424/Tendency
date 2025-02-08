require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');

async function fixTaskOwnership() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find tasks with missing or invalid user references
    const invalidTasks = await Task.find({ $or: [
      { user: { $exists: false } },
      { user: null }
    ]});

    console.log(`Found ${invalidTasks.length} invalid tasks`);

    // Delete tasks with invalid ownership
    if (invalidTasks.length > 0) {
      await Task.deleteMany({
        _id: { $in: invalidTasks.map(t => t._id) }
      });
      console.log('Deleted invalid tasks');
    }

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTaskOwnership(); 