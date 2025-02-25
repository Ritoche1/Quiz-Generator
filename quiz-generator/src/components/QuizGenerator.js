'use client';

import { useState } from 'react';

export default function QuizGenerator({ onGenerate }) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);


  const canPing = async () => {
    try {
      const response = await fetch('http://2.12.244.24:5000/ping', { // Port 5000
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
    } catch (error) {
      console.error('Error pinging server:', error);
    }
  };
  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (!canPing()) {
        console.log('Cannot ping server');
        return;
      }
      const response = await fetch('http://2.12.244.24:5000/generate-quiz', { // Port 5000
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, difficulty }),
      });
      const data = await response.json();
      onGenerate(data.quiz);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg " data-testid="quiz-generator"> 
      <input
        type="text"
        placeholder="Enter a topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? 'Generating...' : 'Generate Quiz'}
      </button>
    </div>
  );
}