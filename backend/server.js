require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const taskRoutes = require('./routes/taskRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const testRoute = require('./routes/testRoute');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Add your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// JWT Secret check
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables!');
  process.exit(1);
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', testRoute);

// Add this before your routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message 
  });
});

// First, log the connection string (without password) for debugging
const connectionString = process.env.MONGODB_URI?.replace(
  /\/\/([^:]+):([^@]+)@/, 
  '//[username]:[password]@'
);
console.log('Attempting to connect to MongoDB:', connectionString);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log("MongoDB Connected Successfully");
  // Start server only after successful DB connection
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend can access at http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// Add error handlers
mongoose.connection.on('error', err => {
  console.error('MongoDB error after initial connection:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
