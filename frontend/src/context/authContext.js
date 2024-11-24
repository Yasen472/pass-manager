// import React, { createContext, useState, useContext, useEffect } from 'react';
// import useInactivityLogout from '../hooks/useInactivityLogout.js';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const login = (id, user, email, password, token) => {
//     debugger;
//     setIsLoggedIn(true);
//     setUserId(id);
//     setUsername(user);
//     setEmail(email);
//     setPassword(password);
//     localStorage.setItem('isLoggedIn', 'true');
//     localStorage.setItem('username', user);
//     localStorage.setItem('email', email);
//     localStorage.setItem('token', token); // Store token
// };


  
//   const logout = () => {
//     setIsLoggedIn(false);
//     setUserId(null);
//     localStorage.clear();
//   };

//   useEffect(() => {
//     const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
//     const storedUserId = localStorage.getItem('userId');
//     const storedUsername = localStorage.getItem('username'); // Add this line
//     const storedEmail = localStorage.getItem('email'); // Add this line
//     const storedPassword = localStorage.getItem('password'); // Add this line
//     setIsLoggedIn(loggedIn);
//     setUserId(loggedIn ? storedUserId : null);
//     setUsername(loggedIn ? storedUsername : ''); // Set the username if logged in
//     setEmail(loggedIn ? storedEmail : ''); // Set the email if logged in
//     setPassword(loggedIn ? storedPassword : ''); // Set the password if logged in
//   }, []);
  

//    useInactivityLogout(logout, 600000); // 10 minutes in milliseconds

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, userId, login, logout, username, email, password }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use the Auth context
// export const useAuth = () => useContext(AuthContext);



import React, { createContext, useState, useContext, useEffect } from 'react';
import useInactivityLogout from '../hooks/useInactivityLogout.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = (userId, user, email, password, token) => {
    debugger;
    console.log(`User id is ${userId}`)
    setIsLoggedIn(true);
    setUserId(userId);
    setUsername(user);
    setEmail(email);
    setPassword(password);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', user);
    localStorage.setItem('email', email);
    localStorage.setItem('token', token); // Store token
    localStorage.setItem('userId', userId)
};


  
  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.clear();
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('username'); // Add this line
    const storedEmail = localStorage.getItem('email'); // Add this line
    const storedPassword = localStorage.getItem('password'); // Add this line
    setIsLoggedIn(loggedIn);
    setUserId(loggedIn ? storedUserId : null);
    setUsername(loggedIn ? storedUsername : ''); // Set the username if logged in
    setEmail(loggedIn ? storedEmail : ''); // Set the email if logged in
    setPassword(loggedIn ? storedPassword : ''); // Set the password if logged in
  }, []);
  

   useInactivityLogout(logout, 600000); // 10 minutes in milliseconds

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout, username, email, password }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);