import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ListManager from './components/ListManager';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogin = (userId) => {
    setIsLoggedIn(true);
    setUserId(userId);
  };

  const handleRegister = (userId) => {
    setIsLoggedIn(true);
    setUserId(userId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserId(null);
  };

  return (
    <div className="app">
      {isLoggedIn ? (
        <div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
          <ListManager userId={userId} />
        </div>
      ) : showRegister ? (
        <Register onRegister={handleRegister} />
      ) : (
        <Login onLogin={handleLogin} />
      )}

      {!isLoggedIn && (
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="toggle-button"
        >
          {showRegister ? 'Back to Login' : 'Register'}
        </button>
      )}
    </div>
  );
};

export default App;