import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { IoIosEye } from "react-icons/io"; //opened eye
import { FaEyeSlash } from "react-icons/fa"; //closed eye
import TextureImg from '../../assets/images/texture.jpg'


const Login = () => {
    const navigate = useNavigate();
    const { login, username } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [inputType, setInputType] = useState('password');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleVisibilityChange = () => {
        setIsVisible(!isVisible);
        setInputType(prevType => (prevType === 'password' ? 'text' : 'password'));
    }

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
                login(userId, username);

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
        <>
            <div className="login-page">
                <div className="login-image-container">
                    <img src={TextureImg} className="login-image" alt="login-image" />
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
                        />
                        <label htmlFor="password">Password</label>
                        <div className="password-container">
                            <input
                                type={inputType}
                                id="password"
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            {!isVisible ? <IoIosEye className="visibility-icon" size={25} onClick={handleVisibilityChange} /> : <FaEyeSlash className="visibility-icon" size={25} onClick={handleVisibilityChange} />}
                        </div>
                        <button type="submit" className="login-btn">Login</button>
                    </form>
                    <p className="sign-up-message">New User? <Link to="/register">Sign-up</Link></p>
                </div>
            </div>
        </>
    );
};

export default Login;
