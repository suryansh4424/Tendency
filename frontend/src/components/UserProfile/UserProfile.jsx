import React, { useState } from 'react';
import './UserProfile.css';

const API_URL = 'http://localhost:5000/api';

const UserProfile = ({ user, onLogout, onProfileUpdate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || ''
  });
  
  const getInitials = () => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const displayName = user.name || user.username;

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editForm.name })
      });

      const data = await response.json();

      if (response.ok) {
        onProfileUpdate(data.user);
        setIsEditing(false);
        localStorage.setItem('userData', JSON.stringify(data.user));
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="user-profile">
      <button 
        className="profile-button" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title={displayName}
      >
        <div className="avatar">{getInitials()}</div>
      </button>
      
      {isMenuOpen && (
        <div className="profile-menu">
          {!isEditing ? (
            <>
              <div className="profile-info">
                <div className="avatar large">{getInitials()}</div>
                <div className="user-details">
                  <div className="user-name">{displayName}</div>
                  <div className="user-username">@{user.username}</div>
                  {user.email && <div className="user-email">{user.email}</div>}
                  <button 
                    className="edit-profile-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Name
                  </button>
                </div>
              </div>
              <div className="menu-items">
                <div className="membership-status">
                  {user.isPro ? '✨ Premium Member' : '📝 Free Plan'}
                </div>
                <button onClick={onLogout} className="logout-button">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleEdit} className="edit-profile-form">
              <h3>Edit Profile</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="edit-buttons">
                <button type="submit" className="save-button">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile; 