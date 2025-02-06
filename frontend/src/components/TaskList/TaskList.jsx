import React, { useState, useEffect } from 'react';
import './TaskList.css';

const TaskList = ({ tasks, onTaskComplete, onAddTask, onDeleteTask, onEditTask, isProUser }) => {
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');

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

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && editingTask) {
      onEditTask(editingTask._id, editText);
      setEditingTask(null);
      setEditText('');
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setEditText(task.title);
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditText('');
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
            {editingTask && editingTask._id === task._id ? (
              <form onSubmit={handleEditSubmit} className="edit-form">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="task-input"
                  autoFocus
                />
                <div className="edit-buttons">
                  <button type="submit" className="save-btn">
                    Save
                  </button>
                  <button type="button" onClick={cancelEditing} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onTaskComplete(task._id)}
                  id={`task-${task._id}`}
                />
                <label 
                  htmlFor={`task-${task._id}`}
                  className={task.completed ? 'completed' : ''}
                >
                  {task.title}
                </label>
                <div className="task-actions">
                  <button 
                    onClick={() => startEditing(task)}
                    className="edit-btn"
                    title="Edit task"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => onDeleteTask(task._id)}
                    className="delete-btn"
                    title="Delete task"
                  >
                    ×
                  </button>
                </div>
              </>
            )}
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