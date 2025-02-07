import React, { useState } from 'react';
import './Login.css';

const API_URL = 'http://localhost:5000/api';

const Login = ({ onLoginSuccess, switchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login to Tendency</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        <p className="switch-auth">
          Don't have an account? <button onClick={switchToRegister}>Register</button>
        </p>
      </form>
    </div>
  );
};

export default Login; 