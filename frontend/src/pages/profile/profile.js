import React, { useState, useEffect } from 'react';
import { FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import './profile.css';
import { useNavigate, useLocation } from 'react-router-dom'; // For page redirection
import Modal from 'react-modal'; // Modal for 2FA verification

Modal.setAppElement('#root'); // Ensure accessibility

const Profile = () => {
    const navigate = useNavigate();
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

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

    // 2FA modal states
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [twoFAToken, setTwoFAToken] = useState('');
    const [twoFAErrorMessage, setTwoFAErrorMessage] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    useEffect(() => {
        if (!isEditing) {
            setTempInfo(userInfo);
        }
    }, [userInfo, isEditing]);

    const fetchUserInfo = async () => {
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
        setIs2FAModalOpen(true)
    };

    const handleReset = () => {
        setIsResettingPassword(true);
        setIs2FAModalOpen(true);
    }

    const handleVerify2FA = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_AUTH_URL}/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ token: twoFAToken, userInputTime: Date.now() }),
            });

            if (response.ok) {
                setIs2FAModalOpen(false);
                if(isResettingPassword) {
                    navigate('/sec-questions-form', { state: { isResetting: true } });
                }
                setIsEditing(true);
            } else {
                setTwoFAErrorMessage('Invalid 2FA token. Please try again.');
            }
        } catch (error) {
            console.error("Error during 2FA verification:", error);
            setTwoFAErrorMessage('An error occurred during 2FA verification.');
        }
    };

    const openEditMode = () => {
        setIs2FAModalOpen(true);
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
                            onClick={openEditMode}
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
                        <label>Password</label>
                        <div className="password-container">
                            <input
                                type="password"
                                value="********" // Placeholder for security reasons
                                readOnly
                            />
                            <button
                                className="edit-password-button"
                                onClick={handleReset}
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

            <Modal
                isOpen={is2FAModalOpen}
                onRequestClose={() => setIs2FAModalOpen(false)}
                contentLabel="2FA Verification"
                className="modal"
                overlayClassName="overlay"
            >
                <h3>Enter 2FA Token</h3>
                <p>Please enter the token from your authenticator app to proceed.</p>
                <input
                    type="text"
                    placeholder="Enter 2FA token"
                    value={twoFAToken}
                    onChange={(e) => setTwoFAToken(e.target.value)}
                />
                <div className="form-buttons">
                    <button className="save-btn" onClick={handleVerify2FA}>Verify</button>
                    <button
                        className="cancel-btn"
                        onClick={() => setIs2FAModalOpen(false)}
                    >
                        Cancel
                    </button>
                </div>
                {twoFAErrorMessage && <p className="error-message">{twoFAErrorMessage}</p>}
            </Modal>
        </div>
    );
};

export default Profile;

