import React, { useState } from 'react';
import './passwordSetup.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoIosEye } from "react-icons/io";
import { FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";


const PasswordSetup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [metRequirements, setMetRequirements] = useState([]);
  const [missedRequirements, setMissedRequirements] = useState([]);
  const [readyPassword, setReadyPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId; // Retrieve userId from location state
  const authUrl = process.env.REACT_APP_AUTH_URL; // Backend URL

  const isResettingWithoutPassword = location.state?.isResettingWithoutPassword;

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRePasswordVisibility = () => setShowRePassword(!showRePassword);

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

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const validationResult = validatePassword(newPassword);
    if (validationResult === true) {
      setPasswordError('');
    } else {
      setPasswordError(validationResult);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    if (newConfirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if resetting without password
    if (isResettingWithoutPassword) {
      // Here we get the email from localStorage, as per your previous request
      const email = localStorage.getItem('email');

      if (!email) {
        setPasswordError('No email found in localStorage. Please log in again.');
        return;
      }

      try {
        // Send request to update the password
        const response = await axios.put(
          `${authUrl}/update-user-email`,  // Assuming this is the correct endpoint
          { email, newPassword: password }
        );

        // Check if the response was successful
        if (response.status === 200) {
          console.log('Password updated successfully');
          navigate('/login'); // Redirect to login or another relevant page
        }
      } catch (error) {
        console.error('Error updating password:', error);
        setPasswordError('An error occurred while setting your password. Please try again.');
      }

      return; // Prevent further code execution
    }

    const validationResult = validatePassword(password);

    if (validationResult === true) {
      if (password === confirmPassword) {
        try {
          // Retrieve the token from sessionStorage
          const token = sessionStorage.getItem('token'); // Assuming your token is stored under the 'token' key

          // If no token is found, show an error
          if (!token) {
            setPasswordError('Authentication token is missing. Please log in again.');
            return;
          }

          // Send PUT request to update password, including the token in the Authorization header
          const response = await axios.put(
            `${authUrl}/update/${userId}`,
            { password },
            {
              headers: {
                Authorization: `Bearer ${token}`,  // Include token in Authorization header
              },
            }
          );

          console.log(response);

          if (response.status === 200) {
            alert('Password set successfully!');
            navigate('/login'); // Redirect to login page or other relevant page
          }
        } catch (error) {
          console.error('Error updating password:', error);
          setPasswordError('An error occurred while setting your password. Please try again.');
        }
      } else {
        setConfirmPasswordError('Passwords do not match.');
      }
    } else {
      setPasswordError(validationResult);
    }
  };

  return (

    <div className="password-setup-container">
      <form onSubmit={handleSubmit} className="password-setup-form">
        <h2>Create New Password</h2>

        <div className="password-input-group">
          <label htmlFor="new-password">New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="new-password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            required
          />
          {showPassword ? (
            <FaEyeSlash className="password-visibility-icon" size={25} color='black' onClick={togglePasswordVisibility} />
          ) : (
            <IoIosEye className="password-visibility-icon" size={25} color='black' onClick={togglePasswordVisibility} />
          )}
        </div>

        <div className="password-input-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirm-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm new password"
            required
          />
          {showRePassword ? (
            <FaEyeSlash className="password-visibility-icon" size={25} color='black' onClick={toggleRePasswordVisibility} />
          ) : (
            <IoIosEye className="password-visibility-icon" size={25} color='black' onClick={toggleRePasswordVisibility} />
          )}
        </div>

        <div className="pass-dropdown-requirements">
          <div className="pass-dropdown-header">
            <h4>Password Requirements</h4>
          </div>
          <div className="new-password-requirements">
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

        <button type="submit" className="submit-button">
          Set New Password
        </button>
      </form>
    </div>

  );
};

export default PasswordSetup;
