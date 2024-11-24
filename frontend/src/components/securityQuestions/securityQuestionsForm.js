import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './securityQuestionsForm.css';
import axios from 'axios';

const SecurityQuestionsForm = () => {
  const [selectedQuestions, setSelectedQuestions] = useState(['', '', '']);
  const [answers, setAnswers] = useState(['', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]); // To store correct answers from backend
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const authUrl = process.env.REACT_APP_AUTH_URL; // Backend URL for authentication
  const isResetting = location.state?.isResetting || false;

  // Question options for selection
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

  // Fetch saved questions and answers if resetting
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    const fetchUserInfo = async (userId) => {
      try {
          const response = await axios.get(`${authUrl}/user/${userId}?isResetting=true`);
          const { securityInfo } = response.data;
   
          // Ensure that securityInfo contains data
          if (securityInfo?.questions?.length > 0 && securityInfo?.answers?.length > 0) {
              setSelectedQuestions(securityInfo.questions);
              setCorrectAnswers(securityInfo.answers);
              console.log(securityInfo.answers)
          } else {
              console.error("No questions or answers found.");
              setErrorMessage("No security questions found for this user.");
          }
      } catch (error) {
          console.error('Error fetching user info:', error.message);
          setErrorMessage('Failed to load security questions. Please try again.');
      }
   };
   

    if (isResetting) {
      if (userId) {
        fetchUserInfo(userId);
      } else {
        setErrorMessage('User ID is missing. Please log in.');
      }
    }
  }, [isResetting, authUrl]);

  // Handle changes for selected questions and answers
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

    console.log('Submitting form with selectedQuestions:', selectedQuestions);
    console.log('Submitting form with answers:', answers);

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
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');
    if (!userId || !token) {
      setErrorMessage('User ID or token is not available. Please log in.');
      return;
    }

    console.log('Verifying security information...');
    console.log('Provided security info:', providedSecurityInfo);

    // Compare provided answers with correct answers
    const allAnswersCorrect = providedSecurityInfo.every((info, index) =>
      info.answer.trim().toLowerCase() === correctAnswers[index]?.trim().toLowerCase()
    );

    if (!allAnswersCorrect) {
      setErrorMessage('One or more answers are incorrect.');
      return;
    }

    console.log('Security questions verified successfully!');
    // Navigate to new-password-setup on success
    navigate('/new-password-setup', { state: { userId } });
  };

  const saveSecurityInfo = async (securityInfo) => {
    const token = sessionStorage.getItem('token'); // Token for authentication
    const userId = sessionStorage.getItem('userId'); // Assuming userId is stored in sessionStorage
    const qrCodeUrl = sessionStorage.getItem("qrCodeUrl");
  
    if (!token || !userId) {
      setErrorMessage('You are not authenticated. Please log in.');
      return;
    }
  
    if (!qrCodeUrl) {
      setErrorMessage('QR code URL is missing. Please try again.');
      return;
    }
  
    console.log('Saving security info for userId:', userId);
    console.log('Security info being saved:', securityInfo);
  
    try {
      // Make the PUT request to update security info
      
      const response = await axios.put(
        
        `${authUrl}/update-security-info/${userId}`, // Pass userId as URL parameter
        { securityInfo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        
        }

      );
  
      if (response.status === 200) {
        console.log('Security info updated successfully!');
        navigate('/verify-2fa', { state: { userId, token, qrCodeUrl } });
      } else {
        console.log(response)
      }
    } catch (error) {
      // Handle any errors during the request
      const message = error.response?.data?.message || 'Failed to save security questions.';
      console.error('Error saving security info:', error.message);
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
              {`Security Question ${index + 1}:`}
              {isResetting ? (
                // Display question text as static when resetting
                <span className="selected-question">{selectedQuestions[index]}</span>
              ) : (
                // Dropdown for question selection when setting up
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
