import React, { useState, useEffect } from 'react';
import './accounts.css';
import { CiSearch } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import AccountCard from '../../components/accountCard/accountCard.js';
import axios from 'axios';
import { useAuth } from '../../context/authContext.js';

const Accounts = () => {
    const { userId } = useAuth(); // Retrieve userId from AuthContext
    const [accounts, setAccounts] = useState([]); // State to store the list of accounts
    const [selectedAccount, setSelectedAccount] = useState(null); // State for selected account
    const [searchTerm, setSearchTerm] = useState(""); // State for search input
    const [newAccount, setNewAccount] = useState({
        website: '',
        email: '',
        username: '',
        password: '',
    }); // State for new account form
    const [isAddingAccount, setIsAddingAccount] = useState(false); // Toggle for showing add account form

    useEffect(() => {
        console.log(userId)
    }, [])

    useEffect(() => {
        // Fetch accounts when the component mounts
        const fetchAccounts = async () => {
            if (!userId) return; // Ensure userId is available before fetching
            try {
                const response = await axios.get(`/accounts/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token
                    },
                });
                setAccounts(response.data);
            } catch (error) {
                console.error("Error fetching accounts:", error);
            }
        };

        fetchAccounts();
    }, [userId]); // Dependency on userId

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAccount((prev) => ({ ...prev, [name]: value }));
    };

    // Handle new account submission
    const handleSaveAccount = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                '/accounts',
                {
                    userId,
                    ...newAccount,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token
                    },
                }
            );
            const createdAccount = {
                id: response.data.accountId,
                ...newAccount,
            };
            setAccounts((prev) => [...prev, createdAccount]); // Add the new account to the list
            setNewAccount({ website: '', email: '', username: '', password: '' }); // Reset form
            setIsAddingAccount(false); // Hide the form after saving
        } catch (error) {
            console.error("Error adding account:", error);
        }
    };

    // Filter accounts by search term
    const filteredAccounts = accounts.filter(account =>
        account.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                                name="website"
                                placeholder="Website URL"
                                value={newAccount.website}
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
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={newAccount.password}
                                onChange={handleInputChange}
                                required
                            />
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
                            <CgProfile size={400} color="#4079ff" />
                            <div className="account-name-heading">{selectedAccount.website}</div>
                            <div className="details">
                                <p><strong>Email:</strong> {selectedAccount.email}</p>
                                <p><strong>Username:</strong> {selectedAccount.username}</p>
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
