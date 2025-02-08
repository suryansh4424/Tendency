import React, { useState, useEffect } from 'react';
import TaskList from '../TaskList/TaskList';
import HabitGrid from '../HabitGrid/HabitGrid';
import Login from '../Login/Login';
import Register from '../Register/Register';
import UserProfile from '../UserProfile/UserProfile';
import './Dashboard.css';
import { getTokenData, isTokenValid } from '../../utils/auth';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isProUser, setIsProUser] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    console.log('Dashboard mounted');
    fetchTasks();
  }, []);

  useEffect(() => {
    // Try to get user data from localStorage on mount
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching tasks from:', `${API_URL}/tasks`);
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const handleAddTask = async (title, selectedDate) => {
    try {
      // Check if user can add more tasks
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return isToday(taskDate);
      });

      const maxTasks = isProUser ? 10 : 3;
      const warningMessage = isProUser 
        ? "You've reached the maximum limit of 10 tasks for today" 
        : "Free plan is limited to 3 tasks per day. Upgrade to Premium for up to 10 tasks!";

      if (todayTasks.length >= maxTasks) {
        setError(warningMessage);
        return;
      }

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          title,
          date: selectedDate.toISOString(),
          isRecurring: true
        })
      });
      
      if (response.ok) {
        await fetchTasks();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  // Add this function to handle task transfer
  const transferTasksToNextDay = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        await fetchTasks();
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to transfer tasks');
    }
  };

  // Add useEffect to check and transfer tasks at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow - now;

    const midnightTimeout = setTimeout(() => {
      transferTasksToNextDay();
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  // Add this function to handle auth errors
  const handleAuthError = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    // Optionally show a message to the user
    alert('Your session has expired. Please log in again.');
  };

  // Update useEffect to check token validity
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token && isTokenValid()) {
        const tokenData = getTokenData();
        setIsAuthenticated(true);
        setIsProUser(tokenData?.isPro || false);
        fetchTasks();
      } else {
        handleAuthError();
      }
    };

    checkAuth();
  }, []);

  // Update the handleUpgrade function
  const handleUpgrade = async () => {
    try {
      if (!isTokenValid()) {
        alert('Please log in again');
        // Handle re-authentication here
        return;
      }

      console.log('=== UPGRADE REQUEST START ===');
      const token = localStorage.getItem('token');
      console.log('Using token:', token);

      const response = await fetch(`${API_URL}/users/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Parse error:', e);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsProUser(true);
        alert('Successfully upgraded to Premium!');
        await fetchTasks();
      } else {
        throw new Error(data.message || 'Failed to upgrade');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to upgrade: ' + error.message);
    }
  };

  // Update the handleDowngrade function
  const handleDowngrade = async () => {
    try {
      console.log('Initiating downgrade...');
      const response = await fetch(`${API_URL}/users/downgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Log the raw response for debugging
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Invalid server response');
      }

      if (response.ok) {
        console.log('Downgrade successful:', data);
        localStorage.setItem('token', data.token);
        setIsProUser(false);
        
        const message = 'Successfully reverted to Free Plan. Thank you for trying Premium!';
        alert(message);
        
        await fetchTasks();
      } else {
        console.error('Downgrade failed:', data);
        throw new Error(data.message || 'Failed to downgrade');
      }
    } catch (error) {
      console.error('Error during downgrade:', error);
      alert('Failed to downgrade: ' + (error.message || 'Please try again.'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsProUser(false);
  };

  return (
    <>
      {!isAuthenticated ? (
        authMode === 'login' ? (
          <Login 
            onLoginSuccess={(data) => {
              console.log('Login success data:', data);
              setIsAuthenticated(true);
              setIsProUser(data.user.isPro);
              setUserData(data.user);
              fetchTasks();
            }}
            switchToRegister={() => setAuthMode('register')} 
          />
        ) : (
          <Register 
            onRegisterSuccess={(data) => {
              setIsAuthenticated(true);
              setIsProUser(data.user.isPro);
              setUserData(data.user);
              fetchTasks();
            }}
            switchToLogin={() => setAuthMode('login')} 
          />
        )
      ) : (
        <div className="dashboard">
          <header className="dashboard-header">
            <div className="header-left">
              <h1>Tendency</h1>
              <p>Track your daily progress</p>
            </div>
            <div className="header-right">
              {isProUser ? (
                <div className="premium-status">
                  <div className="premium-badge">
                    Premium Member
                  </div>
                  <button 
                    className="downgrade-button"
                    onClick={handleDowngrade}
                    title="Revert to Free Plan"
                  >
                    ↩ Free Plan
                  </button>
                </div>
              ) : (
                <button 
                  className="upgrade-button"
                  onClick={handleUpgrade}
                >
                  Upgrade to Premium
                </button>
              )}
              <UserProfile 
                user={userData || { username: 'User' }}
                onLogout={() => {
                  handleLogout();
                  setUserData(null);
                  localStorage.removeItem('userData');
                }}
                onProfileUpdate={(updatedUser) => {
                  setUserData(updatedUser);
                }}
              />
            </div>
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
                  onAuthError={handleAuthError}
                />
                <HabitGrid tasks={tasks} />
              </>
            )}
          </main>
        </div>
      )}
    </>
  );
};

export default Dashboard;