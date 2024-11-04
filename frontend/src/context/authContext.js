import React, { createContext, useState, useContext, useEffect } from 'react';
import useInactivityLogout from '../hooks/useInactivityLogout.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');

  const login = (id, user) => {
    setIsLoggedIn(true);
    setUserId(id);
    setUsername(user); // Set the username in state
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', id);
    localStorage.setItem('username', user); // Store the new username
  };
  

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username'); // Add this line
    setIsLoggedIn(loggedIn);
    setUserId(loggedIn ? storedUserId : null);
    setUsername(loggedIn ? storedUsername : ''); // Set the username if logged in
  }, []);
  

   useInactivityLogout(logout, 600000); // 10 minutes in milliseconds

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout, username }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);