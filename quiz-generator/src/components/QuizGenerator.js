'use client';

import { useState } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function QuizGenerator({ onGenerate }) {
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Turkish', 'Polish'];
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState(languages[0]);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/generate/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        },
        body: JSON.stringify({
          topic : topic,
          language : language,
          difficulty : difficulty
        }),
      });
      const data = await response.json();
      onGenerate({
        title : topic,
        language : language,
        difficulty : difficulty,
        questions : data
      });
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
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
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
