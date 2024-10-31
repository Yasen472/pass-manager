import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css';
import { useAuth } from '../../context/authContext.js';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleRePasswordChange = (e) => {
    setRePassword(e.target.value);
  };

  // Password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasNumber = /[0-9]/;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) {
      return `Password should be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase.test(password)) {
      return "Password should include at least one uppercase letter.";
    }
    if (!hasLowerCase.test(password)) {
      return "Password should include at least one lowercase letter.";
    }
    if (!hasNumber.test(password)) {
      return "Password should include at least one number.";
    }
    if (!hasSymbol.test(password)) {
      return "Password should include at least one symbol.";
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (!email || !password || !rePassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    // Check if passwords match
    if (password !== rePassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (passwordValidation !== true) {
      setErrorMessage(passwordValidation);
      return;
    }

    // Prepare user data for submission
    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/register`, userData);
      
      if (response.status === 200 || response.status === 201) {
        console.log('Registration successful:', response.data);
        login(response.data.userId);

        // Reset fields and error message
        setEmail('');
        setPassword('');
        setRePassword('');
        setErrorMessage('');
        navigate('/');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <div className='register-container'>
        <h3 className='register-header'>Register</h3>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor='email'>Email</label>
          <input type='email' id='email' value={email} onChange={handleEmailChange} />

          <label htmlFor='password'>Password</label>
          <input type='password' id='password' value={password} onChange={handlePasswordChange} />

          <label htmlFor='rePassword'>Re-enter Password</label>
          <input type='password' id='rePassword' value={rePassword} onChange={handleRePasswordChange} />

          <button type='submit' className='register-btn'>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
