import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './securityQuestionsForm.css';
import axios from 'axios';

const SecurityQuestionsForm = () => {
  const [selectedQuestions, setSelectedQuestions] = useState(['', '', '']);
  const [answers, setAnswers] = useState(['', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const authUrl = process.env.REACT_APP_AUTH_URL; // Backend URL for authentication
  const isResetting = location.state?.isResetting || false;

  const questionOptions = [
    'What is the name of your first pet?',
    'What is the name of the street you grew up on?',
    'What was your childhood nickname?',
    'What was the make and model of your first car?',
    'What is the name of your favorite childhood teacher?',
    'What city were you born in?',
    'What is your mother\'s maiden name?',
    'What is the name of your best friend from childhood?',
    'What was the name of your elementary or primary school?',
    'What is the name of your favorite childhood book or movie?'
  ];

  const handleQuestionChange = (index, value) => {
    const newSelectedQuestions = [...selectedQuestions];
    newSelectedQuestions[index] = value;
    setSelectedQuestions(newSelectedQuestions);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (selectedQuestions.some(q => q === '') || answers.some(a => a === '')) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    // Format the security info as required
    const providedSecurityInfo = selectedQuestions.map((question, index) => ({
      question,
      answer: answers[index],
    }));

    if (isResetting) {
      // Handle security question verification
      await verifySecurityInfo(providedSecurityInfo);
    } else {
      // Handle security question setup
      await saveSecurityInfo(providedSecurityInfo);
    }
  };

  const verifySecurityInfo = async (providedSecurityInfo) => {
    const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in sessionStorage
    if (!userId) {
      setErrorMessage('User ID is not available. Please log in.');
      return;
    }

    try {
      const response = await axios.post(`${authUrl}/verify-security-info`, {
        userId,
        providedSecurityInfo,
      });

      if (response.status === 200) {
        // Navigate to new-password-setup on success
        navigate('/new-password-setup', { state: { userId } });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify security questions.';
      setErrorMessage(message);
    }
  };

  const saveSecurityInfo = async (securityInfo) => {
    const token = sessionStorage.getItem('token'); // Token for authentication
    const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in sessionStorage

    if (!token || !userId) {
      setErrorMessage('You are not authenticated. Please log in.');
      return;
    }

    try {
      const response = await axios.post(
        `${authUrl}/update-security-info`,
        { userId, securityInfo },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is included in the headers
          },
        }
      );

      if (response.status === 200) {
        navigate('/verify-2fa', { state: { userId, token } });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save security questions.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="security-questions-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="security-questions-form">
        <h2>{isResetting ? 'Verify Security Questions' : 'Set Up Security Questions'}</h2>
        {[0, 1, 2].map((index) => (
          <div key={index} className="question-group">
            <label>
              {isResetting ? `Security Question ${index + 1}:` : `Choose Security Question ${index + 1}:`}
              {isResetting ? (
                <span className="selected-question">{selectedQuestions[index]}</span>
              ) : (
                <select
                  value={selectedQuestions[index]}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  required
                >
                  <option value="">Select a question</option>
                  {questionOptions.map((question) => (
                    <option
                      key={question}
                      value={question}
                      disabled={selectedQuestions.includes(question)}
                    >
                      {question}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <input
              type="text"
              placeholder={`Answer to Question ${index + 1}`}
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              required
            />
          </div>
        ))}
        <button type="submit" className="submit-button">
          {isResetting ? 'Verify Security Questions' : 'Save Security Questions'}
        </button>
      </form>
    </div>
  );
};

export default SecurityQuestionsForm;
