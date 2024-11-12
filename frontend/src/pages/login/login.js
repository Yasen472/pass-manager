// import React, { useState } from 'react';
// import axios from 'axios';
// import './login.css';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../context/authContext.js';
// import { IoIosEye } from "react-icons/io"; // Opened eye icon
// import { FaEyeSlash } from "react-icons/fa"; // Closed eye icon
// import TextureImg from '../../assets/images/texture.jpg';

// const Login = () => {
//     const navigate = useNavigate();
//     const { login } = useAuth();

//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [isPasswordVisible, setIsPasswordVisible] = useState(false);

//     const handleEmailChange = (e) => setEmail(e.target.value);
//     const handlePasswordChange = (e) => setPassword(e.target.value);

//     const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setErrorMessage('');  // Clear any previous errors

//         // Basic validation for empty fields
//         if (!email || !password) {
//             setErrorMessage('Please fill in all fields.');
//             return;
//         }

//         try {
//             const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/login`, { email, password });

//             if (response.status === 200) {
//                 const { _id: userId, username } = response.data;
//                 console.log('Login successful:', response.data);

//                 // Store user details and navigate to the home page
//                 login(userId, username, email, password);
//                 setEmail('');
//                 setPassword('');
//                 navigate('/');
//             }
//         } catch (error) {
//             console.error('Error during login:', error);
//             // Display specific error message if available
//             const message = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
//             setErrorMessage(message);
//         }
//     };

//     return (
//         <div className="login-page">
//             <div className="login-image-container">
//                 <img src={TextureImg} className="login-image" alt="login background" />
//                 <div className="login-image-text">Welcome Back!</div>
//             </div>
//             <div className="login-container">
//                 <h3 className="login-header">Login</h3>
//                 {errorMessage && <p className="error-message">{errorMessage}</p>}
//                 <form className="login-form" onSubmit={handleSubmit}>
//                     <label htmlFor="email">Email</label>
//                     <input
//                         type="email"
//                         id="email"
//                         value={email}
//                         onChange={handleEmailChange}
//                         required
//                     />
//                     <label htmlFor="password">Password</label>
//                     <div className="password-container">
//                         <input
//                             type={isPasswordVisible ? "text" : "password"}
//                             id="password"
//                             value={password}
//                             onChange={handlePasswordChange}
//                             required
//                         />
//                         {isPasswordVisible ? (
//                             <FaEyeSlash className="visibility-icon" size={25} onClick={togglePasswordVisibility} />
//                         ) : (
//                             <IoIosEye className="visibility-icon" size={25} onClick={togglePasswordVisibility} />
//                         )}
//                     </div>
//                     <button type="submit" className="login-btn">Login</button>
//                 </form>
//                 <p className="sign-up-message">New User? <Link to="/register">Sign-up</Link></p>
//             </div>
//         </div>
//     );
// };

// export default Login;


import React, { useState } from 'react';
import axios from 'axios';
import './login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { IoIosEye } from "react-icons/io"; // Opened eye icon
import { FaEyeSlash } from "react-icons/fa"; // Closed eye icon
import TextureImg from '../../assets/images/texture.jpg';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFACode, setTwoFACode] = useState('');  // New state for 2FA code
    const [errorMessage, setErrorMessage] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleTwoFACodeChange = (e) => setTwoFACode(e.target.value); // Handler for 2FA code input

    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');  // Clear any previous errors

        // Basic validation for empty fields
        if (!email || !password || !twoFACode) {  // Check if all fields are filled
            setErrorMessage('Please fill in all fields, including the 2FA code.');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_AUTH_URL}/login`, { 
                email, 
                password, 
                twoFACode  // Include 2FA code in the login request
            });

            if (response.status === 200) {
                const { _id: userId, username } = response.data;
                console.log('Login successful:', response.data);

                // Store user details and navigate to the home page
                login(userId, username, email, password);
                setEmail('');
                setPassword('');
                setTwoFACode('');  // Clear 2FA code field after successful login
                navigate('/');
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

                    {/* New field for 2FA code */}
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
                <p className="sign-up-message">New User? <Link to="/register">Sign-up</Link></p>
            </div>
        </div>
    );
};

export default Login;
