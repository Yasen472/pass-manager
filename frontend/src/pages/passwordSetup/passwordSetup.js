import React, { useState } from 'react';
import './passwordSetup.css';

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

const PasswordSetup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationResult = validatePassword(password);
    
    if (validationResult === true) {
      if (password === confirmPassword) {
        console.log('Password set successfully');
        alert('Password set successfully!');
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
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? 'text' : 'password'}
              id="new-password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {passwordError && (
            <div className="error-message">{passwordError}</div>
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
          {confirmPasswordError && (
            <div className="error-message">{confirmPasswordError}</div>
          )}
        </div>

        <div className="password-requirements">
          <p>Password must include:</p>
          <ul>
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One lowercase letter</li>
            <li>One number</li>
            <li>One symbol</li>
          </ul>
        </div>

        <button type="submit" className="submit-button">
          Set New Password
        </button>
      </form>
    </div>
  );
};

export default PasswordSetup;