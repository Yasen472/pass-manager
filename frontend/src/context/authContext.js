import React, { createContext, useState, useContext, useEffect } from 'react';
import useInactivityLogout from '../hooks/useInactivityLogout.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  const login = (id) => {
    setIsLoggedIn(true);
    setUserId(id);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', id);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserId = localStorage.getItem('userId');
    setIsLoggedIn(loggedIn);
    setUserId(loggedIn ? storedUserId : null);
  }, []);

   useInactivityLogout(logout, 600000); // 10 minutes in milliseconds

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);