import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correct import
import './accounts.css';
import { CiSearch } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Visibility icons
import AccountCard from '../../components/accountCard/accountCard.js';
import { useAuth } from '../../context/authContext.js';

const Accounts = () => {
    const [userId, setUserId] = useState(null); // State to store userId after decoding the token
    const [accounts, setAccounts] = useState([]); // State to store the list of accounts
    const [selectedAccount, setSelectedAccount] = useState(null); // State for selected account
    const [searchTerm, setSearchTerm] = useState(""); // State for search input
    const [newAccount, setNewAccount] = useState({
        accountName: '',
        email: '',
        username: '',
        password: '',
    }); // State for new account form
    const [isAddingAccount, setIsAddingAccount] = useState(false); // Toggle for showing add account form
    const [isEditing, setIsEditing] = useState(false); // Toggle for editing mode
    const [passwordVisible, setPasswordVisible] = useState(false); // State to manage password visibility

    // Fetch userId from the token when the component mounts
    useEffect(() => {
        // Get the token from localStorage (or wherever it is stored)
        const token = localStorage.getItem('token'); // Assuming the JWT is stored in localStorage
        if (token) {
            try {
                // Decode the JWT token to get the payload
                const decodedToken = jwtDecode(token);
                // Extract the userId from the decoded token
                setUserId(decodedToken.id); // Assuming the token payload contains the 'id' field
            } catch (error) {
                console.error("Error decoding the token:", error);
            }
        }
    }, []); // Empty dependency array means this runs once on mount

    // Simulate hardcoded accounts
    useEffect(() => {
        const hardcodedAccounts = [
            {
                id: 1,
                accountName: 'Google',
                email: 'example@gmail.com',
                username: 'exampleUser',
                password: 'password123',
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-01T10:00:00Z',
            },
            {
                id: 2,
                accountName: 'Facebook',
                email: 'example2@gmail.com',
                username: 'userFB',
                password: 'password456',
                createdAt: '2024-01-02T11:00:00Z',
                updatedAt: '2024-01-02T11:00:00Z',
            },
        ];
        setAccounts(hardcodedAccounts); // Set the hardcoded accounts when the component mounts
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAccount((prev) => ({ ...prev, [name]: value }));

        // If editing an account, update selectedAccount
        if (selectedAccount && isEditing) {
            setSelectedAccount((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Handle new account submission
    const handleSaveAccount = (e) => {
        e.preventDefault();

        const currentTimestamp = new Date().toISOString();

        const newAccountData = {
            id: accounts.length + 1,
            ...newAccount,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        };

        setAccounts((prev) => [...prev, newAccountData]);
        setNewAccount({ accountName: '', email: '', username: '', password: '' }); // Reset form
        setIsAddingAccount(false); // Hide the form after saving
    };

    // Save the changes after editing the selected account
    const handleSaveEditedAccount = () => {
        const currentTimestamp = new Date().toISOString();

        setSelectedAccount((prev) => ({
            ...prev,
            updatedAt: currentTimestamp,
        }));

        setIsEditing(false);
    };

    // Filter accounts by search term
    const filteredAccounts = accounts.filter(account =>
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setPasswordVisible((prevState) => !prevState);
    };

    // Function to format the date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date)) {
            return "Invalid date";
        }
        return date.toLocaleString();
    };

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
                    />
                    <button className="sort-btn">Sort</button>
                    <button className="add-btn" onClick={() => setIsAddingAccount(true)}>Add Account</button>
                </div>
                {filteredAccounts.map((account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        onClick={() => setSelectedAccount(account)}
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
                                <span className="password-visibility-icon" onClick={togglePasswordVisibility}>
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
                                        <input
                                            type="email"
                                            name="email"
                                            value={selectedAccount.email}
                                            onChange={handleInputChange}
                                        />
                                        <input
                                            type="text"
                                            name="username"
                                            value={selectedAccount.username}
                                            onChange={handleInputChange}
                                        />
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
                                        <div className="form-buttons">
                                            <button
                                                type="button"
                                                className="save-btn"
                                                onClick={handleSaveEditedAccount}
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Email:</strong> {selectedAccount.email}</p>
                                        <p><strong>Username:</strong> {selectedAccount.username}</p>
                                        <div className="acc-password-container">
                                            <span className="acc-password-label">Password:</span>
                                            <span className="acc-password-placeholder">*****</span>
                                        </div>
                                        <p><strong>Created At:</strong> {formatDate(selectedAccount.createdAt)}</p>
                                        <p><strong>Updated At:</strong> {formatDate(selectedAccount.updatedAt)}</p>
                                        <button
                                            className="edit-btn"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="heading">Select or Add an Account</div>
                )}
            </div>
        </div>
    );
};

export default Accounts;
