import React, { useState } from 'react';
import './Register.css';

const API_URL = 'http://localhost:5000/api';

const Register = ({ onRegisterSuccess, switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onRegisterSuccess(data);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Create Account</h2>
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
        <button type="submit" className="register-button">Register</button>
        <p className="switch-auth">
          Already have an account? <button onClick={switchToLogin}>Login</button>
        </p>
      </form>
    </div>
  );
};

export default Register; 