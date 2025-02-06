import React, { useState, useEffect } from 'react';
import TaskList from '../TaskList/TaskList';
import HabitGrid from '../HabitGrid/HabitGrid';
import './Dashboard.css';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isProUser] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted');
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching tasks from:', `${API_URL}/tasks`);
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched tasks:', data);
        setTasks(data);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error details:', error);
      setError('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchTasks(); // Refresh tasks after update
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleAddTask = async (title) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      
      if (response.ok) {
        await fetchTasks(); // Refresh tasks after adding
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to delete task');
    }
  };

  const handleEditTask = async (taskId, newTitle) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === taskId ? updatedTask : task
          )
        );
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to update task');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Tendency</h1>
        <p>Track your daily progress</p>
      </header>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <main className="dashboard-content">
        {isLoading ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onTaskComplete={handleTaskComplete}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
              isProUser={isProUser}
            />
            <HabitGrid tasks={tasks} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;