'use client';

import { useEffect, useRef } from 'react';

const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

export default function QuizRecap({ quiz, selectedAnswers, onRestart }) {
  const didMountRef = useRef(false);
  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        score++;
      }
    });
    return score;
  };

  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    const submitQuizAttempt = async () => {
      try {
        console.log(quiz);
        const response = await fetch(`${baseUrl}/quizzes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title : quiz.title,
            description : "Quiz about " + quiz.title + " with " + quiz.questions.length + " questions in "  + quiz.difficulty + " difficulty in " + quiz.language + " language",
            language : quiz.language,
            questions : quiz.questions,
          })
        });
        
        if (!response.ok) throw new Error('Failed to save attempt');
      } catch (error) {
        console.error('Error submitting quiz attempt:', error);
      }
    };

    if (quiz.questions.length > 0) {
      submitQuizAttempt();
    }
  }, []);

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-black">
      <h2 className="text-2xl font-bold mb-4">Quiz Recap</h2>
      <p className="mb-4">
        You scored {calculateScore()} out of {quiz.questions.length}.
      </p>
      {quiz.questions.map((question, index) => (
        <div key={index} className="mb-4">
          <p className="font-bold">{question.question}</p>
          <p className={selectedAnswers[index] === question.answer ? 'text-green-600' : 'text-red-600'}>
            Your answer: {selectedAnswers[index]}
          </p>
          <p>Correct answer: {question.answer}</p>
        </div>
      ))}
      <button
        onClick={onRestart}
        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Start Over
      </button>
    </div>
  );
}