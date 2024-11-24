
import React, { useState, useEffect } from 'react';
import { FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import './profile.css';
import { useNavigate, useLocation } from 'react-router-dom'; // Add React Router navigation

const Profile = () => {
    const navigate = useNavigate(); // For page redirection
    const userId = localStorage.getItem("userId"); // Assuming token is available for authentication
    const token = localStorage.getItem("token");

    const location = useLocation();
    const isResetting = location.state?.isResetting || false;

    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempInfo, setTempInfo] = useState({ ...userInfo });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        debugger;
        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    useEffect(() => {
        debugger;
        if (!isEditing) {
            setTempInfo(userInfo); // Sync tempInfo with userInfo after editing
        }
    }, [userInfo, isEditing]);

    const fetchUserInfo = async () => {
        debugger;
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_AUTH_URL}/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data.');
            }

            const data = await response.json();

            // Populate user info with only the fields returned by the backend
            const updatedInfo = {
                username: data.username || '',
                email: data.email || '',
            };

            setUserInfo(updatedInfo);
            setTempInfo(updatedInfo);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_AUTH_URL}/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: tempInfo.username,
                    email: tempInfo.email,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user data.');
            }

            const updatedData = await response.json();

            // Update the user info with the returned data
            const updatedInfo = {
                username: updatedData.username || tempInfo.username,
                email: updatedData.email || tempInfo.email,
            };

            setUserInfo(updatedInfo);
            setTempInfo(updatedInfo);
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = () => {
        setTempInfo(userInfo);
        setIsEditing(false);
    };

    const handlePasswordEdit = () => {
        // Redirect to /sec-questions-form when the user wants to reset their password
        navigate('/sec-questions-form', { state: { isResetting: true } });
    };

    if (loading) {
        return <div className="profile-container">Loading...</div>;
    }

    if (error) {
        return <div className="profile-container">Error: {error}</div>;
    }

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
                        <label>New Password</label>
                        <div className="password-container">
                            <input
                                type="password"
                                value="********" // Placeholder for security reasons
                                readOnly
                            />
                            <button
                                className="edit-password-button"
                                onClick={handlePasswordEdit}
                            >
                                Reset Password
                            </button>
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
