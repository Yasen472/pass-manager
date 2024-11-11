import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../../context/authContext.js';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const { email } = useAuth();
  
  useEffect(() => {
    // Optionally, fetch the user's email from somewhere (e.g., localStorage, context)
    // or set it to an empty string by default
    setMessage('Please check your inbox for a verification link.');
  }, []);
  
  const handleResend = async () => {

    console.log(email)

    try {
      const response = await axios.post('http://localhost:8080/auth/resend-verification-email', { email });
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error resending email:", error);
      setMessage('An error occurred while resending the verification email.');
    }
  };

  return (
    <div className="verify-email-container">
      <h2>Email Verification</h2>
      <p>{message}</p>

      <button onClick={handleResend}>Resend Verification Email</button>
    </div>
  );
};

export default VerifyEmailPage;
