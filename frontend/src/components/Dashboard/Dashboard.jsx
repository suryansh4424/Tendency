import React, { useState, useEffect } from 'react';
import TaskList from '../TaskList/TaskList';
import HabitGrid from '../HabitGrid/HabitGrid';
import './Dashboard.css';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [habitData, setHabitData] = useState([]);
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
      console.log('Toggling task:', taskId);
      const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        console.log('Task updated:', updatedTask);
        // Update the task in the local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId ? updatedTask : task
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Error toggling task:', errorData);
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleAddTask = async (title) => {
    try {
      console.log('Adding task:', title);
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const newTask = await response.json();
        console.log('New task added:', newTask);
        // Update tasks state immediately
        setTasks(prevTasks => [...prevTasks, newTask]);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('Error adding task:', errorData);
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Tendency</h1>
        <p>Track your daily progress</p>
      </header>
      
      <div className="daily-quote">
        <q>Success is not final, failure is not fatal: it is the courage to continue that counts.</q>
        <p>— Winston Churchill</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <main className="dashboard-content">
        {isLoading ? (
          <div className="loading">Loading your progress...</div>
        ) : (
          <>
            <TaskList
              tasks={tasks}
              onTaskComplete={handleTaskComplete}
              onAddTask={handleAddTask}
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