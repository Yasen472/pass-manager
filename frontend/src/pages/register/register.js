import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css';
import { useAuth } from '../../context/authContext.js';
import TextureImg from '../../assets/images/texture.jpg';
import { IoIosEye } from "react-icons/io";
import { FaEyeSlash, FaCheckCircle, FaTimesCircle, FaTimes, FaTasks } from "react-icons/fa"; // Add icons for check and X
// FaTasks - requirements icon

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
  const [metRequirements, setMetRequirements] = useState([]);
  const [missedRequirements, setMissedRequirements] = useState([]);
  const [readyPassword, setReadyPassword] = useState(false);
  const [showReq, setShowReq] = useState(false); // State for showing requirements
  const [showButton, setShowButton] = useState(false);
  const [showReqMenu, setShowReqMenu] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

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
    if (missedRequirements.length > 0) {
      setErrorMessage('Please ensure all password requirements are met.');
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

  useEffect(() => {

    console.log(`ShowReq is ${showReqMenu}`)

  }, [showReqMenu])

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
            {!isPassVisible ? (
              <IoIosEye className="pass-visibility-icon" size={25} onClick={handleVisibilityChange} />
            ) : (
              <FaEyeSlash className="visibility-icon" size={25} onClick={handleVisibilityChange} />
            )}
          </div>
          {showReq ? (
            <div className="requirements-container" onClick={(e) =>{
              e.preventDefault()
              setShowReqMenu(true) 
            } }>
              {readyPassword ? (
                <>
                  <div>Meets requirements </div><FaCheckCircle color="green" />
                </>
              ) : (
                <>
                  <div>Meets requirements</div><FaTimesCircle className="x-requirements-icon" color="red"/>
                </>
              )}
            </div>
          ) : null}


          {showReqMenu ? (
            <div className="dropdown-requirements">
              <div className="dropdown-header">
                <h4>Password Requirements</h4>
                <FaTimes className="close-icon" onClick={() => setShowReqMenu(false)} />
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
          ) : null}

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
