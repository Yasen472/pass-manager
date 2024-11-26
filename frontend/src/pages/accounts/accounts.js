import React, { useState, useEffect } from 'react';
import './accounts.css';
import { CgProfile } from "react-icons/cg";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaSort } from "react-icons/fa";
import AccountCard from '../../components/accountCard/accountCard.js';
import Modal from 'react-modal';

const API_BASE_URL = 'http://localhost:8080';

Modal.setAppElement('#root');

const Accounts = () => {
    const [userId, setUserId] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [newAccount, setNewAccount] = useState({
        accountName: '',
        email: '',
        username: '',
        password: '',
    });
    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [twoFAToken, setTwoFAToken] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showSortOptions, setShowSortOptions] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("Token not found in localStorage.");
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/user-id`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUserId(data.userId);
            } catch (error) {
                console.error("Error fetching userId:", error);
            }
        };

        if (localStorage.getItem('token')) {
            fetchUserId();
        }
    }, []);

    const fetchAccounts = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAccounts(data);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [userId]);

    const handleSort = (direction) => {
        const sortedAccounts = [...accounts].sort((a, b) => {
            if (direction === 'asc') {
                return a.accountName.localeCompare(b.accountName);
            } else {
                return b.accountName.localeCompare(a.accountName);
            }
        });
        setAccounts(sortedAccounts);
        setShowSortOptions(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAccount((prev) => ({ ...prev, [name]: value }));

        if (selectedAccount && isEditing) {
            setSelectedAccount((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveAccount = async (e) => {
        e.preventDefault();

        try {
            if (!userId) {
                console.error("UserId is not available");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ownerId: userId,
                    ...newAccount
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNewAccount({ accountName: '', email: '', username: '', password: '' });
            setIsAddingAccount(false);
            fetchAccounts();
        } catch (error) {
            console.error("Error saving account:", error);
        }
    };

    const handleSaveEditedAccount = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts/update/${selectedAccount.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    accountName: selectedAccount.accountName,
                    email: selectedAccount.email,
                    username: selectedAccount.username,
                    password: selectedAccount.password,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchAccounts();
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating account:", error);
        }
    };

    const handleDeleteAccount = async (accountId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setAccounts(accounts.filter(account => account.id !== accountId));
            if (selectedAccount?.id === accountId) {
                setSelectedAccount(null);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    const handleVerify2FA = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ token: twoFAToken, userInputTime: Date.now() }),
            });

            if (response.ok) {
                setIs2FAModalOpen(false);
                setIsEditing(true);
            } else {
                setErrorMessage('Invalid 2FA token. Please try again.');
            }
        } catch (error) {
            console.error("Error during 2FA verification:", error);
            setErrorMessage('An error occurred during 2FA verification.');
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState);
    };

    const filteredAccounts = accounts.filter(account =>
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="accounts-page-container">
            <div className="left-content-container">
                <div className="heading">Accounts List</div>
                <hr />
                <div className="filtration-container">
                    <input
                        type="text"
                        placeholder="Search Accounts"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='search-accounts-input'
                    />
                    <div className="sort-container">
                        <button 
                            className="sort-btn"
                            onMouseEnter={() => setShowSortOptions(true)}
                            onMouseLeave={() => setShowSortOptions(false)}
                        >
                            <FaSort /> Sort
                            {showSortOptions && (
                                <div className="sort-options">
                                    <div onClick={() => handleSort('asc')}>
                                        A to Z
                                    </div>
                                    <div onClick={() => handleSort('desc')}>
                                        Z to A
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                    <button className="add-btn" onClick={() => setIsAddingAccount(true)}>Add Account</button>
                </div>
                {filteredAccounts.map((account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        onClick={() => setSelectedAccount(account)}
                        onDelete={() => handleDeleteAccount(account.id)}
                    />
                ))}
            </div>

            <div className="vertical-divider"></div>

            <div className="right-content-container">
                {isAddingAccount ? (
                    <>
                        <div className="heading">Add New Account</div>
                        <hr />
                        <form className="add-account-form" onSubmit={handleSaveAccount}>
                            <input
                                type="text"
                                name="accountName"
                                placeholder="Account Name"
                                value={newAccount.accountName}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={newAccount.email}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={newAccount.username}
                                onChange={handleInputChange}
                            />
                            <div className="password-container">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={newAccount.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <span className="password-accounts-visibility-icon" onClick={togglePasswordVisibility}>
                                    {passwordVisible ? <FiEyeOff /> : <FiEye />}
                                </span>
                            </div>
                            <div className="form-buttons">
                                <button type="submit" className="save-btn">Save</button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setIsAddingAccount(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                ) : selectedAccount ? (
                    <>
                        <div className="heading">Account Information</div>
                        <hr />
                        <div className="left-section">
                            <CgProfile size={380} color="#4079ff" />
                            <div className="account-name-heading">{selectedAccount.accountName}</div>
                            <div className="details">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <strong>Email:</strong>
                                            <input
                                                type="email"
                                                name="email"
                                                value={selectedAccount.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <strong>Username:</strong>
                                            <input
                                                type="text"
                                                name="username"
                                                value={selectedAccount.username}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div>
                                            <strong>Password:</strong>
                                            <div className="password-container">
                                                <input
                                                    type={passwordVisible ? "text" : "password"}
                                                    name="password"
                                                    value={selectedAccount.password}
                                                    onChange={handleInputChange}
                                                />
                                                <span className="password-visibility-icon" onClick={togglePasswordVisibility}>
                                                    {passwordVisible ? <FiEyeOff /> : <FiEye />}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div><strong>Email:</strong> {selectedAccount.email}</div>
                                        <div><strong>Username:</strong> {selectedAccount.username}</div>
                                        <div><strong>Password:</strong> {'*'.repeat(selectedAccount.password.length)}</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="form-buttons" style={{ width: '100%', justifyContent: 'center' }}>
                            {isEditing ? (
                                <button className="save-btn" onClick={handleSaveEditedAccount}>Save</button>
                            ) : (
                                <button className="edit-btn" onClick={() => setIs2FAModalOpen(true)}>Edit</button>
                            )}
                            <button
                                className="delete-btn"
                                onClick={() => handleDeleteAccount(selectedAccount.id)}
                            >
                                Delete
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setSelectedAccount(null);
                                    setIsEditing(false);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-message">Select an account to view details</div>
                )}
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
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </Modal>
        </div>
    );
};

export default Accounts;