import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Quizz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('https://opentdb.com/api.php?amount=10&category=21&type=multiple'); // Fetches 10 questions from the sports category
        setQuestions(response.data.results);
      } catch (error) {
        console.error('Error fetching the questions', error);
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  return (
    <div style={styles.triviaContainer}>
      {showScore ? (
        <div style={styles.scoreSection}>
          <h2 style={styles.scoreTitle}>Quiz Completed!</h2>
          <p style={styles.scoreText}>You scored {score} out of {questions.length}</p>
          <button 
            onClick={restartQuiz} 
            style={styles.restartButton}
          >
            Restart Quiz
          </button>
        </div>
      ) : (
        <>
          {questions.length > 0 && (
            <>
              <div style={styles.questionSection}>
                <div style={styles.questionCount}>
                  <span>Question {currentQuestion + 1}</span>/{questions.length}
                </div>
                <div 
                  style={styles.questionText}
                  dangerouslySetInnerHTML={{ __html: questions[currentQuestion].question }}
                />
              </div>
              <div style={styles.answerSection}>
                {questions[currentQuestion].incorrect_answers
                  .concat(questions[currentQuestion].correct_answer)
                  .sort(() => Math.random() - 0.5)
                  .map((answerOption, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerOptionClick(answerOption === questions[currentQuestion].correct_answer)}
                      style={styles.answerButton}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.answerButtonHover.backgroundColor}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.answerButton.backgroundColor}
                      dangerouslySetInnerHTML={{ __html: answerOption }}
                    />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  triviaContainer: {
    fontFamily: 'Inter, Arial, sans-serif',
    maxWidth: '700px',
    margin: '2rem auto',
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
    transition: 'all 0.3s ease',
  },
  questionSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
  },
  questionCount: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  questionText: {
    fontSize: '1.5rem',
    color: '#2c3e50',
    lineHeight: '1.4',
    fontWeight: '600',
  },
  answerSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  answerButton: {
    display: 'block',
    width: '100%',
    padding: '1rem',
    margin: '0.5rem 0',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    fontSize: '1rem',
  },
  answerButtonHover: {
    backgroundColor: '#4f46e5',
  },
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
  },
  scoreTitle: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  scoreText: {
    fontSize: '1.5rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  restartButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
  },
};

export default Quizz;
