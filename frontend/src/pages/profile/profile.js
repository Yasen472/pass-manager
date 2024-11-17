import React, { useState, useEffect } from 'react';
import { FiEye, FiEyeOff, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import './profile.css';
import { useAuth } from '../../context/authContext.js';

const Profile = () => {

    const { userId, isLoggedIn, username, email } = useAuth();

    const [userInfo, setUserInfo] = useState({
        username: 'JohnDoe123',
        email: 'john.doe@example.com',
        password: 'currentpassword123'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [tempInfo, setTempInfo] = useState({ ...userInfo });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        setUserInfo(tempInfo);
        setIsEditing(false);
        setShowPassword(false); // Reset password visibility to false after saving
    };

    const handleCancel = () => {
        setTempInfo(userInfo);
        setIsEditing(false);
        setShowPassword(false); // Ensure password visibility is reset on cancel
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <h1>Profile Settings</h1>
                    {!isEditing && (
                        <button 
                            className="edit-button"
                            onClick={() => setIsEditing(true)}
                        >
                            <FiEdit2 />
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="profile-image-container">
                    <div className="profile-image">
                        {/* Using initials as placeholder */}
                        {userInfo.username.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="profile-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={isEditing ? tempInfo.username : userInfo.username}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={isEditing ? tempInfo.email : userInfo.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={isEditing ? tempInfo.password : userInfo.password}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                            {isEditing && (
                                <button 
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="button-group">
                            <button className="save-button" onClick={handleSave}>
                                <FiCheck />
                                Save Changes
                            </button>
                            <button className="cancel-button" onClick={handleCancel}>
                                <FiX />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
