import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage('');

        if (!email || !password) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/login`, { email, password });

            if (response.status === 200) {
                const userId = response.data._id;
                console.log('Login successful:', response.data);
                login(userId);

                setEmail('');
                setPassword('');

                navigate('/');
            }
        } catch (error) {
            console.error('Error during login:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Login failed. Please check your credentials and try again.');
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h3 className="login-header">Login</h3>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <button type="submit" className="login-btn">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;