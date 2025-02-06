import React, { useState, useEffect } from 'react';
import './TaskList.css';

const TaskList = ({ tasks, onTaskComplete, onAddTask, isProUser }) => {
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    console.log('TaskList received tasks:', tasks);
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    console.log('Submitting new task:', newTask);
    if (newTask.trim() && (!isProUser && tasks.length < 7)) {
      onAddTask(newTask);
      setNewTask('');
    }
  };

  const handleTaskToggle = (taskId) => {
    console.log('Toggling task:', taskId);
    onTaskComplete(taskId);
  };

  return (
    <div className="task-list">
      <h2>Daily Tasks</h2>
      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="task-input"
        />
        <button type="submit" className="add-task-btn">
          Add Task
        </button>
      </form>
      
      <div className="tasks">
        {Array.isArray(tasks) && tasks.map((task) => (
          <div key={task._id} className="task-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskToggle(task._id)}
              id={`task-${task._id}`}
            />
            <label 
              htmlFor={`task-${task._id}`}
              className={task.completed ? 'completed' : ''}
            >
              {task.title}
            </label>
          </div>
        ))}
      </div>
      
      {!isProUser && (
        <div className="free-user-notice">
          {tasks.length}/7 tasks used (Free Plan)
        </div>
      )}
    </div>
  );
};

export default TaskList;