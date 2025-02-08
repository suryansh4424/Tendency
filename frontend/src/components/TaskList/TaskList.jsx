import React, { useState } from 'react';
import './TaskList.css';
import { getTokenData, isTokenValid } from '../../utils/auth';

const API_URL = 'http://localhost:5000/api';

const TaskList = ({ tasks, onTaskComplete, onAddTask, onDeleteTask, onEditTask, isProUser, onAuthError }) => {
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper functions
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  // Get today's tasks
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return isToday(taskDate);
  });

  // Get tasks for selected date
  const currentDateTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    const selectedDateOnly = new Date(selectedDate);
    return taskDate.getDate() === selectedDateOnly.getDate() &&
           taskDate.getMonth() === selectedDateOnly.getMonth() &&
           taskDate.getFullYear() === selectedDateOnly.getFullYear();
  });

  // Add this helper function to check if the selected date is today
  const isSelectedDateToday = () => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();
  };

  // Event handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !newTask.trim()) return;

    try {
      if (!isTokenValid()) {
        onAuthError?.();
        return;
      }

      // Get today's tasks count
      const todayTaskCount = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return isToday(taskDate);
      }).length;

      // Check task limit based on user status
      const maxTasks = isProUser ? 10 : 3;
      if (todayTaskCount >= maxTasks) {
        const message = isProUser 
          ? "You've reached the maximum limit of 10 tasks for today"
          : "Free plan is limited to 3 tasks per day. Upgrade to Premium for up to 10 tasks!";
        alert(message);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: newTask,
          date: selectedDate.toISOString(),
          isRecurring: true
        })
      });

      if (response.status === 401) {
        onAuthError?.();
        return;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add task');
      }

      setIsSubmitting(true);
      await onAddTask(newTask, selectedDate);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
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

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= new Date()) {
      setSelectedDate(nextDay);
    }
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);  // Reset time to start of day

    // Free users can only go back to yesterday
    if (!isProUser) {
      if (isSelectedDateToday()) {  // If on today, allow going to yesterday
        setSelectedDate(yesterday);
      }
    } else {
      // Pro users can go back further
      setSelectedDate(prevDay);
    }
  };

  return (
    <div className="task-list">
      <h2>Daily Tasks</h2>
      
      <div className="date-navigation">
        <button 
          onClick={goToPreviousDay}
          className="date-nav-btn"
          disabled={!isProUser && !isSelectedDateToday()}
          title={!isProUser && !isSelectedDateToday() ? "Upgrade to Premium to access older days" : ""}
        >
          {!isProUser && !isSelectedDateToday() ? '🔒' : '←'}
        </button>
        <span className="current-date">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
        <button 
          onClick={goToNextDay}
          className="date-nav-btn"
          disabled={isToday(selectedDate)}
        >
          →
        </button>
      </div>

      {/* Only show the form if selected date is today */}
      {isSelectedDateToday() && (
        <form onSubmit={handleSubmit} className="task-form">
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
      )}

      <div className="tasks">
        <div className="task-group">
          <h3 className="date-header">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            <span className="task-count">
              {currentDateTasks.filter(t => t.completed).length}/
              {isProUser ? currentDateTasks.length : Math.min(3, currentDateTasks.length)} completed
            </span>
          </h3>
          <div className="task-list-items">
            {currentDateTasks.map((task, index) => {
              const taskDate = new Date(task.date);
              const isLocked = !isToday(taskDate) && !isProUser;
              const isOverLimit = !isProUser && index >= 3;  // Check if task is beyond free limit
              
              return (
                <div 
                  key={task._id} 
                  className={`task-item ${isLocked ? 'locked' : ''} ${isOverLimit ? 'over-limit' : ''}`}
                >
                  {isOverLimit ? (
                    // Show premium overlay for tasks beyond limit
                    <div className="premium-task-preview">
                      <div className="blurred-task">
                        <input type="checkbox" disabled />
                        <span>{task.title}</span>
                      </div>
                      <div className="premium-overlay">
                        <div className="premium-benefits">
                          <span>Premium Benefits</span>
                          <ul>
                            <li>Up to 10 daily tasks</li>
                            <li>Edit previous days</li>
                            <li>Advanced habit tracking</li>
                          </ul>
                        </div>
                        <button 
                          className="upgrade-button"
                          onClick={() => window.alert('Upgrade feature coming soon!')}
                        >
                          Upgrade to Premium
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Regular task display
                    <>
                      {editingTask && editingTask._id === task._id && !isLocked ? (
                        <form onSubmit={handleEditSubmit} className="edit-form">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="task-input"
                            autoFocus
                          />
                          <div className="edit-buttons">
                            <button type="submit" className="save-btn">Save</button>
                            <button type="button" onClick={cancelEditing} className="cancel-btn">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => !isLocked && onTaskComplete(task._id)}
                            disabled={isLocked}
                          />
                          <span className={task.completed ? 'completed' : ''}>
                            {task.title}
                          </span>
                          {isLocked ? (
                            <div className="task-actions">
                              <span className="lock-icon" title="Upgrade to Premium to access previous days">🔒</span>
                            </div>
                          ) : (
                            <div className="task-actions">
                              <button onClick={() => startEditing(task)} className="edit-btn" title="Edit task">
                                ✎
                              </button>
                              <button onClick={() => onDeleteTask(task._id)} className="delete-btn" title="Delete task">
                                ×
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;