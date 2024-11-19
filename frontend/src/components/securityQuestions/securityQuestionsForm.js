import React, { useState } from 'react';
import './securityQuestionsForm.css';

const SecurityQuestionsForm = () => {
  const [selectedQuestions, setSelectedQuestions] = useState(['', '', '']);
  const [answers, setAnswers] = useState(['', '', '']);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic could be added here
    console.log('Selected Questions:', selectedQuestions);
    console.log('Answers:', answers);
    alert('Security questions saved!');
  };

  return (
    <div className="security-questions-container">
      <form onSubmit={handleSubmit} className="security-questions-form">
        <h2>Set Up Security Questions</h2>
        {[0, 1, 2].map((index) => (
          <div key={index} className="question-group">
            <label>
              Choose Security Question {index + 1}:
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
          Save Security Questions
        </button>
      </form>
    </div>
  );
};

export default SecurityQuestionsForm;