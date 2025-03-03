'use client';

import { useState, useEffect } from 'react';
import QuizGenerator from '@/components/QuizGenerator';
import QuizQuestion from '@/components/QuizQuestion';
import QuizRecap from '@/components/QuizRecap';
import AuthForm from '@/components/AuthForm';

const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

export default function Home({ initialQuiz = null}) {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showRecap, setShowRecap] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [bgClass, setBgClass] = useState('bg-default');
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const token = localStorage.getItem('quizToken');
      // check if token is valid fetching /auth/me
      fetch(`${baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
      setLoading(false);
  }, []);

  const handleLogin = () => {
      setIsAuthenticated(true);
  };

  
  const handleGenerate = (quizData) => {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      setError('No questions found. Please try again.');
      return;
    }
    setQuiz(quizData);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowRecap(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setBgClass('bg-default');
  };
  
  const handleAnswer = (answer) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswerCorrect = answer === currentQuestion.answer;
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setBgClass(isAnswerCorrect ? 'bg-correct' : 'bg-incorrect');
    
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsCorrect(null);
      setShowFeedback(false);
      setBgClass('bg-default');
    } else {
      setShowRecap(true);
    }
  };
  
  const handleRestart = () => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowRecap(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setBgClass('bg-default');
  };
  
  if (loading) return <div className="min-h-screen bg-default flex items-center justify-center">Loading...</div>;
  
  // if (!isAuthenticated) {
  //     return (
  //         <div className="min-h-screen bg-default flex flex-col items-center justify-center p-4">
  //             <h1 className="text-4xl font-bold mb-8 text-white">Quiz Generator</h1>
  //             <AuthForm />
  //         </div>
  //     );
  // }

  return (
    <div className={`min-h-screen gradient-bg flex flex-col items-center justify-center text-white p-4 ${bgClass}  transition-all duration-2000`}>
      <h1 className="text-4xl font-bold mb-8">Mistral AI Quiz Generator</h1>
      {isAuthenticated && quiz && quiz.questions && quiz.questions.length > 0 && !showRecap ? (
        <>
          <QuizQuestion
            question={quiz.questions[currentQuestionIndex].question}
            options={quiz.questions[currentQuestionIndex].options}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
          />
          {showFeedback && (
            <button
              onClick={handleNextQuestion}
              className="w-full max-w-md bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-300 mt-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </>
      ) : showRecap ? (
        <QuizRecap quiz={quiz} selectedAnswers={selectedAnswers} onRestart={handleRestart} />
      ) : isAuthenticated ? (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-black">
          <QuizGenerator onGenerate={handleGenerate} />
          <p {...error && { className: 'text-red-500' }}>{error}</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-black">
          <AuthForm onLogin={handleLogin}/>
        </div>
      )}
    </div>
  );
}
