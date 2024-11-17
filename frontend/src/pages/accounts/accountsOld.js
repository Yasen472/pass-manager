import React, { useState } from 'react';
import './accounts.css';
import { FaEyeSlash, FaEdit } from "react-icons/fa";
import { IoIosEye } from "react-icons/io";
import ProfilePicture from '../../assets/images/anonymous_picture.png';

const Accounts = () => {
  // Hardcoded demo accounts
  const demoAccounts = [
    { username: 'YascoPi4a', email: 'test123@abv.bg', password: '1234ads#$%FA' },
    { username: 'JohnDoe42', email: 'john.doe@example.com', password: 'securePass123' },
    { username: 'JaneSmith89', email: 'jane.smith@example.com', password: 'MyPassword@987' },
  ];

  const [accounts, setAccounts] = useState(demoAccounts);
  const [isEditing, setIsEditing] = useState(null);  // Track which account is being edited
  const [isPassVisible, setIsPassVisible] = useState({});

  const handleVisibilityChange = (index) => {
    setIsPassVisible(prevState => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleEditClick = (index) => {
    setIsEditing(index);  // Enable editing for the selected account
  };

  const handleSaveClick = (index) => {
    // Save logic here (you can send to API or just update the state)
    setIsEditing(null); // Exit edit mode
  };

  const handleCancelClick = () => {
    setIsEditing(null); // Exit edit mode without saving
  };

  const handleChange = (e, index, field) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index][field] = e.target.value;
    setAccounts(updatedAccounts);
  };

  return (
    <div className="accounts-page-container">
      <h1 className="vault-title">Accounts Vault</h1>
      <div className="accounts-list">
        {accounts.map((account, index) => (
          <div className="account-card" key={index}>
            <img className='account-card-profile-image' src={ProfilePicture} alt="Profile" />
            <div className="account-info">
              {/* Editable username */}
              <div className="field-container">
                <label>Username</label>
                {isEditing === index ? (
                  <input
                    type="text"
                    value={account.username}
                    onChange={(e) => handleChange(e, index, 'username')}
                    className="editable-field"
                  />
                ) : (
                  <p>{account.username}</p>  // Display username as a paragraph
                )}
                <button
                  className="edit-btn"
                  onClick={() => handleEditClick(index)}
                  aria-label="Edit Username"
                >
                  <FaEdit size={18} />
                </button>
              </div>

              {/* Editable email */}
              <div className="field-container">
                <label>Email</label>
                {isEditing === index ? (
                  <input
                    type="email"
                    value={account.email}
                    onChange={(e) => handleChange(e, index, 'email')}
                    className="editable-field"
                  />
                ) : (
                  <p>{account.email}</p>  // Display email as a paragraph
                )}
                <button
                  className="edit-btn"
                  onClick={() => handleEditClick(index)}
                  aria-label="Edit Email"
                >
                  <FaEdit size={18} />
                </button>
              </div>

              {/* Editable password */}
              <div className="field-container">
                <label>Password</label>
                {isEditing === index ? (
                  <input
                    type={isPassVisible[index] ? 'text' : 'password'}
                    value={account.password}
                    onChange={(e) => handleChange(e, index, 'password')}
                    className="editable-field"
                  />
                ) : (
                  <p>{account.password}</p>  // Display password as a paragraph
                )}
                <button
                  className="visibility-btn"
                  onClick={() => handleVisibilityChange(index)}
                  aria-label="Toggle Password Visibility"
                >
                  {isPassVisible[index] ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <IoIosEye size={20} />
                  )}
                </button>
              </div>

              {/* Save/Cancel buttons if editing */}
              {isEditing === index && (
                <div className="edit-buttons">
                  <button
                    className="save-btn"
                    onClick={() => handleSaveClick(index)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounts;