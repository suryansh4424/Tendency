require('dotenv').config();
const mongoose = require('mongoose');

async function fixEmailIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the existing email index
    await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Dropped old email index');

    // Create new sparse index
    await mongoose.connection.collection('users').createIndex(
      { email: 1 },
      { 
        unique: true,
        sparse: true,
        background: true
      }
    );
    console.log('Created new sparse email index');

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixEmailIndex(); 