import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css';
import { useAuth } from '../../context/authContext.js';
import TextureImg from '../../assets/images/texture.jpg'
import { IoIosEye } from "react-icons/io"; //opened eye
import { FaEyeSlash } from "react-icons/fa"; //closed eye

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPassVisible, setIsPassVisible] = useState(false);
  const [isRePassVisible, setIsRePassVisible] = useState(false);
  const [inputType, setInputType] = useState('password');
  const [repassInputType, setRepassInputType] = useState('password');

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

  const handleVisibilityChange = () => {
    setIsPassVisible(!isPassVisible);
    setInputType(prevType => (prevType === 'password' ? 'text' : 'password'));
  }

  const handleRepassVisibilityChange = () => {
    setIsRePassVisible(!isRePassVisible);
    setRepassInputType(prevType => (prevType === 'password' ? 'text' : 'password'));
  }

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
      <div className="register-image-container">
        <img src={TextureImg} className="register-image" alt="login-image" />
        <div className="register-image-text">Welcome Back!</div>
      </div>
      <div className='register-container'>
        <h3 className='register-header'>Register</h3>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor='email'>Email</label>
          <input type='email' id='email' value={email} onChange={handleEmailChange} />
            <label htmlFor='password'>Password</label>
          <div className="register-password-container">
            <input type={inputType} id='password' value={password} onChange={handlePasswordChange} />
            {!isPassVisible ? <IoIosEye className="pass-visibility-icon" size={25} onClick={handleVisibilityChange} /> : <FaEyeSlash className="visibility-icon" size={25} onClick={handleVisibilityChange} />}
          </div>
          <label htmlFor='rePassword'>Re-enter Password</label>
          <div className="repassword-container">
            <input type={repassInputType} id='rePassword' value={rePassword} onChange={handleRePasswordChange} />
            {!isRePassVisible ? <IoIosEye className="repass-visibility-icon" size={25} onClick={handleRepassVisibilityChange} /> : <FaEyeSlash className="visibility-icon" size={25} onClick={handleRepassVisibilityChange} />}
          </div>
          <button type='submit' className='register-btn'>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
