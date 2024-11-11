import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css';
import { useAuth } from '../../context/authContext.js';
import TextureImg from '../../assets/images/texture.jpg';
import { IoIosEye } from "react-icons/io";
import { FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Icons for check and X

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPassVisible, setIsPassVisible] = useState(false);
  const [isRePassVisible, setIsRePassVisible] = useState(false);
  const [inputType, setInputType] = useState('password');
  const [repassInputType, setRepassInputType] = useState('password');
  const [metRequirements, setMetRequirements] = useState([]);
  const [missedRequirements, setMissedRequirements] = useState([]);
  const [readyPassword, setReadyPassword] = useState(false);
  const [showReq, setShowReq] = useState(false); // Show requirements label
  const [showButton, setShowButton] = useState(false);
  const [showReqMenu, setShowReqMenu] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    setShowReq(true);
    setShowButton(newPassword.length > 0);
  };

  const handleRePasswordChange = (e) => {
    setRePassword(e.target.value);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const newMetRequirements = [];
    const newMissedRequirements = [];

    if (password.length >= minLength) newMetRequirements.push("At least 8 characters");
    else newMissedRequirements.push("At least 8 characters");

    if (hasUpperCase) newMetRequirements.push("At least one uppercase letter");
    else newMissedRequirements.push("At least one uppercase letter");

    if (hasLowerCase) newMetRequirements.push("At least one lowercase letter");
    else newMissedRequirements.push("At least one lowercase letter");

    if (hasNumber) newMetRequirements.push("At least one number");
    else newMissedRequirements.push("At least one number");

    if (hasSymbol) newMetRequirements.push("At least one special character");
    else newMissedRequirements.push("At least one special character");

    setMetRequirements(newMetRequirements);
    setMissedRequirements(newMissedRequirements);
    setReadyPassword(newMissedRequirements.length === 0);
  };

  const handleVisibilityChange = () => {
    setIsPassVisible(!isPassVisible);
    setInputType(prevType => (prevType === 'password' ? 'text' : 'password'));
  };

  const handleRepassVisibilityChange = () => {
    setIsRePassVisible(!isRePassVisible);
    setRepassInputType(prevType => (prevType === 'password' ? 'text' : 'password'));
  };

// Inside handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!username || !email || !password || !rePassword) {
      setErrorMessage('Please fill in all fields.');
      return;
  }

  if (password !== rePassword) {
      setErrorMessage('Passwords do not match.');
      return;
  }

  if (missedRequirements.length > 0) {
      setErrorMessage('Please ensure all password requirements are met.');
      return;
  }

  const userData = {
      email: email,
      password: password,
      username: username
  };

  try {
      const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/register`, userData);

      if (response.status === 201) { // Only need 201 here
          console.log('Registration successful:', response.data);
          navigate('/verify-email')
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
        <div className="register-image-text">Sign Up Today</div>
      </div>
      <div className='register-container'>
        <h3 className='register-header'>Register</h3>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor='username'>Username</label>
          <input type='text' id='username' value={username} onChange={handleUsernameChange} />

          <label htmlFor='email'>Email</label>
          <input type='email' id='email' value={email} onChange={handleEmailChange} />

          <div className="password-container">
            <label htmlFor='password'>Password</label>
            <div className="register-password-container">
              <input type={inputType} id='password' value={password} onChange={handlePasswordChange} />
              {!isPassVisible ? (
                <IoIosEye className="pass-visibility-icon" size={25} onClick={handleVisibilityChange} />
              ) : (
                <FaEyeSlash className="visibility-icon" size={25} onClick={handleVisibilityChange} />
              )}
            </div>

            {showReq ? (
              <div
                className="requirements-container"
                onMouseEnter={() => setShowReqMenu(true)}
                onMouseLeave={() => setShowReqMenu(false)}
              >
                {readyPassword ? (
                  <>
                    <div>Meets requirements </div><FaCheckCircle color="green" />
                  </>
                ) : (
                  <>
                    <div>Meets requirements</div><FaTimesCircle className="x-requirements-icon" color="red" />
                  </>
                )}
              </div>
            ) : null}

            {/* Display the requirements menu on hover */}
            {showReqMenu && (
              <div className="dropdown-requirements">
                <div className="dropdown-header">
                  <h4>Password Requirements</h4>
                </div>
                <div className="password-requirements">
                  {metRequirements.map((req, idx) => (
                    <div key={idx} className="requirement met">
                      <FaCheckCircle color="green" /> {req}
                    </div>
                  ))}
                  {missedRequirements.map((req, idx) => (
                    <div key={idx} className="requirement missed">
                      <FaTimesCircle color="red" /> {req}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label htmlFor='rePassword'>Re-enter Password</label>
          <div className="repassword-container">
            <input type={repassInputType} id='rePassword' value={rePassword} onChange={handleRePasswordChange} />
            {!isRePassVisible ? (
              <IoIosEye className="repass-visibility-icon" size={25} onClick={handleRepassVisibilityChange} />
            ) : (
              <FaEyeSlash className="visibility-icon" size={25} onClick={handleRepassVisibilityChange} />
            )}
          </div>
          <button type='submit' className='register-btn'>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;

