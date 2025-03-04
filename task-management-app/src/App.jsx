import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ListManager from './components/ListManager';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Dodano stan ładowania

  // Funkcja do sprawdzania, czy użytkownik jest zalogowany
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false); // Zakończ ładowanie, jeśli nie ma tokenu
      return;
    }

    try {
      // Wysłanie żądania do backendu w celu walidacji tokenu
      const response = await fetch('http://localhost:5000/api/validate-token', {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserId(data.userId); // Ustaw userId na podstawie odpowiedzi z backendu
      } else {
        localStorage.removeItem('token'); // Usuń nieprawidłowy token
      }
    } catch (err) {
      console.error('Błąd podczas walidacji tokenu:', err);
    } finally {
      setIsLoading(false); // Zakończ ładowanie niezależnie od wyniku
    }
  };

  // Sprawdź autoryzację przy pierwszym renderowaniu komponentu
  useEffect(() => {
    checkAuth();
  }, []);

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

  // Jeśli aplikacja jest w trakcie ładowania, wyświetl komunikat
  if (isLoading) {
    return <div>Loading...</div>;
  }

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