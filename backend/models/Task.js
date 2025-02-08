const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure user field is always populated in queries
taskSchema.pre('find', function(next) {
  if (!this._conditions.user) {
    console.error('Attempting to query tasks without user ID');
    this._conditions.user = null; // This will ensure no results are returned
  }
  next();
});

taskSchema.pre('findOne', function(next) {
  if (!this._conditions.user) {
    console.error('Attempting to query single task without user ID');
    this._conditions.user = null;
  }
  next();
});

// Ensure user field is set when creating new tasks
taskSchema.pre('save', function(next) {
  if (!this.user) {
    next(new Error('Task must have a user'));
    return;
  }
  
  // Ensure user is stored as string
  this.user = this.user.toString();
  next();
});

// Add method to check ownership
taskSchema.methods.belongsTo = function(userId) {
  return this.user.toString() === userId.toString();
};

// Add this to your existing indexes
taskSchema.index({ user: 1, date: 1, title: 1 });

module.exports = mongoose.model('Task', taskSchema);
