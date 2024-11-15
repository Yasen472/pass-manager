// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../../context/authContext.js';
// import './profile.css';
// import ProfilePicture from '../../assets/images/anonymous_picture.png';
// import { FaEdit } from "react-icons/fa";
// import axios from 'axios';

// // add the editableField component to this page so it works 

// const Profile = () => {
//   const { username, email, password, userId } = useAuth();
//   const [editedUsername, setEditedUsername] = useState('');
//   const [editedEmail, setEditedEmail] = useState('');
//   const [editedPassword, setEditedPassword] = useState('');
//   const [isEditing, setIsEditing] = useState(false); //will be set to true when user edits any of the fields;
//   const [editedInfo, setEditedInfo] = useState({});

//   // saves the new information which has been edited
//   const handleEdit = async (req, res) => {
//     console.log(editedInfo)
//     // axios.put(`/update/${userId}`, editedInfo)
//     // console.log(`handleEdit`)
//   }

//   const handleEmailChange = (event) => {
//     editedInfo.email = event.target.value;
//   }

//   const handleUsernameChange = (event) => {
//     editedInfo.username = event.target.value;
//   }

//   const handlePasswordChange = (event) => {
//     editedInfo.passowrd = event.target.value
//   }

//   return (
//     <div className="profile-page">
//       <div className="profile-picture-container">
//         <img className="profile-picture" src={ProfilePicture} alt="profile" />
//         <div>Welcome, {username}</div>
//       </div>
     
//       <div className="profile-details">
//         <h2>Account Settings</h2>
        
//         <div className="profile-field">
//           <label>Username</label>
//           <div className="input-icon-container">
//             <input type="text" value={username} onChange={handleUsernameChange} readOnly/>
//             <FaEdit className="edit-icon" />
//           </div>
//         </div>

//         <div className="profile-field">
//           <label>Password</label>
//           <div className="input-icon-container">
//             <input type="password" value={password} onChange={handlePasswordChange} readOnly/>
//             <FaEdit className="edit-icon" />
//           </div>
//         </div>

//         <div className="profile-field">
//           <label>Email address</label>
//           <div className="input-icon-container">
//             <input type="email" value={email} onChange={handleEmailChange} read/>
//             <FaEdit className="edit-icon" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

import React, { useState } from 'react';
import './profile.css'

const Profile = () => {
  const [accounts, setAccounts] = useState([
    {
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123'
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      password: 'securepassword'
    }
  ]);

  const [newAccount, setNewAccount] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setNewAccount({
      ...newAccount,
      [e.target.name]: e.target.value
    });
  };

  const handleAddAccount = () => {
    setAccounts([...accounts, newAccount]);
    setNewAccount({
      username: '',
      email: '',
      password: ''
    });
  };

  const handleUpdateAccount = (index, updatedAccount) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index] = updatedAccount;
    setAccounts(updatedAccounts);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Password Manager</h1>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'medium', marginBottom: '0.5rem' }}>Add New Account</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
            <input
              name="username"
              placeholder="Username"
              value={newAccount.username}
              onChange={handleInputChange}
              style={{ border: '1px solid #d2d6dc', borderRadius: '0.375rem', padding: '0.5rem 1rem', width: '100%' }}
            />
            <input
              name="email"
              placeholder="Email"
              value={newAccount.email}
              onChange={handleInputChange}
              style={{ border: '1px solid #d2d6dc', borderRadius: '0.375rem', padding: '0.5rem 1rem', width: '100%' }}
            />
            <input
              name="password"
              placeholder="Password"
              type="password"
              value={newAccount.password}
              onChange={handleInputChange}
              style={{ border: '1px solid #d2d6dc', borderRadius: '0.375rem', padding: '0.5rem 1rem', width: '100%' }}
            />
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button
              onClick={handleAddAccount}
              style={{ backgroundColor: '#3b82f6', color: 'white', fontWeight: '500', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Add Account
            </button>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'medium', marginBottom: '0.5rem' }}>Saved Accounts</h2>
          {accounts.map((account, index) => (
            <div key={index} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
                <input
                  name="username"
                  placeholder="Username"
                  value={account.username}
                  onChange={(e) => handleUpdateAccount(index, { ...account, username: e.target.value })}
                  style={{ border: '1px solid #d2d6dc', borderRadius: '0.375rem', padding: '0.5rem 1rem', width: '100%' }}
                />
                <input
                  name="email"
                  placeholder="Email"
                  value={account.email}
                  onChange={(e) => handleUpdateAccount(index, { ...account, email: e.target.value })}
                  style={{ border: '1px solid #d2d6dc', borderRadius: '0.375rem', padding: '0.5rem 1rem', width: '100%' }}
                />
                <input
                  name="password"
                  placeholder="Password"
                  type="password"
                  value={account.password}
                  onChange={(e) => handleUpdateAccount(index, { ...account, password: e.target.value })}
                  style={{ border: '1px solid #d2d6dc', borderRadius: '0.375rem', padding: '0.5rem 1rem', width: '100%' }}
                />
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button
                  style={{ backgroundColor: '#3b82f6', color: 'white', fontWeight: '500', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer' }}
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;