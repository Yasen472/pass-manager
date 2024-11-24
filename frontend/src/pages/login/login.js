import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { IoIosEye } from "react-icons/io";
import { FaEyeSlash } from "react-icons/fa";
import TextureImg from '../../assets/images/texture.jpg';
import { useSecurityContext } from '../../context/securityContext'; 

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setIsResetting, setIsResettingWithoutPassword } = useSecurityContext();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleTwoFACodeChange = (e) => setTwoFACode(e.target.value);

    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    // const handleForgotPassword = async () => {
    //     if (!email || !twoFACode) {
    //         setErrorMessage('Please enter your email and 2FA code before resetting your password.');
    //         return;
    //     }

    //     debugger;
    //     try {
    //         const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/verify-2fa-code`, {
    //             email,
    //             twoFACode,
    //         });

    //         if (response.status === 200) {
    //             setIsResetting(true);
    //             setIsResettingWithoutPassword(true); 
    //             navigate('/new-password-setup', { state: { email, isResse: true } });
    //         }
    //     } catch (error) {
    //         console.error("Error verifying 2FA code:", error);
    //         const message = error.response?.data?.message || 'Failed to verify 2FA code.';
    //         setErrorMessage(message);
    //     }
    // };


    const handleForgotPassword = async () => {
        if (!email || !twoFACode) {
            setErrorMessage('Please enter your email and 2FA code before resetting your password.');
            return;
        }
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/verify-2fa-code`, {
                email,
                twoFACode,
            });
    
            if (response.status === 200) {
                // Update both states before navigating
                setIsResetting(true);
                setIsResettingWithoutPassword(true);
                
                // Store email in localStorage with a value indicating the reset state
                localStorage.setItem('email', email);
    
                // Pass necessary state via navigate
                navigate('/new-password-setup', { 
                    state: { 
                        email, 
                        isResettingWithoutPassword: true 
                    } 
                });
            }
        } catch (error) {
            console.error("Error verifying 2FA code:", error);
            const message = error.response?.data?.message || 'Failed to verify 2FA code.';
            setErrorMessage(message);
        }
    };
    
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!email || !password || !twoFACode) {
            setErrorMessage('Please fill in all fields, including the 2FA code.');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/login`, {
                email,
                password,
                twoFACode,
            });

            if (response.status === 200) {
                const { _id: userId, username, token } = response.data;
                login(userId, username, email, password, token);
                setEmail('');
                setPassword('');
                setTwoFACode('');
                navigate('/accounts');
            }
        } catch (error) {
            console.error('Error during login:', error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials and 2FA code.';
            setErrorMessage(message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-image-container">
                <img src={TextureImg} className="login-image" alt="login background" />
                <div className="login-image-text">Welcome Back!</div>
            </div>
            <div className="login-container">
                <h3 className="login-header">Login</h3>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <div className="password-container">
                        <input
                            type={isPasswordVisible ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {isPasswordVisible ? (
                            <FaEyeSlash className="visibility-icon" size={25} onClick={togglePasswordVisibility} />
                        ) : (
                            <IoIosEye className="visibility-icon" size={25} onClick={togglePasswordVisibility} />
                        )}
                    </div>
                    <label htmlFor="twoFACode">2FA Code</label>
                    <input
                        type="text"
                        id="twoFACode"
                        value={twoFACode}
                        onChange={handleTwoFACodeChange}
                        required
                    />
                    <button type="submit" className="login-btn">Login</button>
                </form>
                <div className="forgot-password">
                    <span
                        className="forgot-password-text"
                        onClick={handleForgotPassword}
                    >
                        Forgotten Password?
                    </span>
                </div>
                <p className="sign-up-message">New User? <Link to="/register">Sign-up</Link></p>
            </div>
        </div>
    );
};

export default Login;
