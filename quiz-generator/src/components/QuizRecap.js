'use client';

import { useEffect, useRef } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

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

  const submitQuizAttempt = async () => {
    try {
      const response = await fetch(`${baseUrl}/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        },
        body: JSON.stringify({
          title : quiz.title,
          description : "Quiz about " + quiz.title + " with " + quiz.questions.length + " questions in "  + quiz.difficulty + " difficulty in " + quiz.language + " language",
          language : quiz.language,
          questions : quiz.questions,
          difficulty : quiz.difficulty,
        })
      });
      
      if (!response.ok) throw new Error('Failed to save attempt');
      const data = await response.json();
      submitUserScore(data.id);
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
    }
  };

  const submitUserScore = async (quiz_id, isUpdate = false) => {
    let response = { ok: false };
    let method = 'POST';

    // fetch GET /quizzes/:id to get the quiz details if it's an update
    if (isUpdate) {
      response = await fetch(`${baseUrl}/scores/${quiz_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        }
      });
      const data = await response.json();
      if (response.ok && response.status === 200 && data.quiz_id === quiz.id) {
        method = 'PUT';
      } else {
        submitQuizAttempt();
        return;
      }
    }

    try {
      const body = JSON.stringify({
        score : calculateScore(),
        max_score : quiz.questions.length,
        answers : selectedAnswers,
      });

      response = await fetch(`${baseUrl}/scores/${quiz_id}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        },
        body: body
      });

      if (!response.ok) throw new Error('Failed to save score');
    }
    catch (error) {
      console.error('Error submitting user score:', error);
    }
  }


  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    
    if (quiz.difficulty === "redo") {
      submitUserScore(quiz.id, true);
      return;
    }

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