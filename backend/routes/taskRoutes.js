const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  createTask, 
  toggleTask, 
  deleteTask,
  updateTask,
  transferTasks
} = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

// All routes require authentication
router.use(auth);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.patch('/:id/toggle', toggleTask);
router.delete('/:id', deleteTask);
router.post('/transfer', transferTasks);

module.exports = router;
