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

  const getDifficultyIcon = (level) => {
    switch (level) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '🟢';
    }
  };

  return (
    <div className="w-full max-w-lg glass-card p-8 rounded-2xl hover-lift" data-testid="quiz-generator"> 
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Quiz</h2>
        <p className="text-gray-600">Generate an AI-powered quiz on any topic</p>
      </div>

      <div className="space-y-6">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📚 Quiz Topic
          </label>
          <input
            type="text"
            placeholder="e.g., World History, JavaScript, Biology..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⚡ Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                  difficulty === level
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{getDifficultyIcon(level)}</div>
                  <div className={`text-sm font-medium ${difficulty === level ? 'text-indigo-800' : 'text-gray-700'}`}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🌐 Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="form-select"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className={`btn-primary w-full ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="loading-spinner"></div>
              <span>Generating Quiz...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Generate Quiz</span>
            </div>
          )}
        </button>
      </div>

      {/* Additional Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Want more control?</p>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            Try Quiz Editor →
          </button>
        </div>
      </div>
    </div>
  );
}
