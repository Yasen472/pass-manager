import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext.js';
import './profile.css';
import ProfilePicture from '../../assets/images/anonymous_picture.png';
import { FaEdit } from "react-icons/fa";
import axios from 'axios';

// add the editableField component to this page so it works 

const Profile = () => {
  const { username, email, password, userId } = useAuth();
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false); //will be set to true when user edits any of the fields;
  const [editedInfo, setEditedInfo] = useState({});

  // saves the new information which has been edited
  const handleEdit = async (req, res) => {
    console.log(editedInfo)
    // axios.put(`/update/${userId}`, editedInfo)
    // console.log(`handleEdit`)
  }

  const handleEmailChange = (event) => {
    editedInfo.email = event.target.value;
  }

  const handleUsernameChange = (event) => {
    editedInfo.username = event.target.value;
  }

  const handlePasswordChange = (event) => {
    editedInfo.passowrd = event.target.value
  }

  return (
    <div className="profile-page">
      <div className="profile-picture-container">
        <img className="profile-picture" src={ProfilePicture} alt="profile" />
        <div>Welcome, {username}</div>
      </div>
     
      <div className="profile-details">
        <h2>Account Settings</h2>
        
        <div className="profile-field">
          <label>Username</label>
          <div className="input-icon-container">
            <input type="text" value={username} onChange={handleUsernameChange} readOnly/>
            <FaEdit className="edit-icon" />
          </div>
        </div>

        <div className="profile-field">
          <label>Password</label>
          <div className="input-icon-container">
            <input type="password" value={password} onChange={handlePasswordChange} readOnly/>
            <FaEdit className="edit-icon" />
          </div>
        </div>

        <div className="profile-field">
          <label>Email address</label>
          <div className="input-icon-container">
            <input type="email" value={email} onChange={handleEmailChange} read/>
            <FaEdit className="edit-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;