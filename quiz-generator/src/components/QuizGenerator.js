'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import GeneratingScreen from './GeneratingScreen';
import ConfirmModal from './ConfirmModal';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function QuizGenerator({ onGenerate }) {
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Turkish', 'Polish'];
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState(languages[0]);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [abortCtrl, setAbortCtrl] = useState(null);
  const [recentTopics, setRecentTopics] = useState([]);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [limitInfoLoading, setLimitInfoLoading] = useState(false);
  const [showNoQuotaModal, setShowNoQuotaModal] = useState(false);

  const suggestions = useMemo(() => (
    ['World History', 'JavaScript Basics', 'Photosynthesis', 'French Verbs', 'US Geography', 'Data Structures']
  ), []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentTopics') || '[]');
      if (Array.isArray(stored)) setRecentTopics(stored.slice(0, 8));
    } catch {}
  }, []);

  const fetchRemaining = async () => {
    try {
      setLimitInfoLoading(true);
      const res = await fetch(`${baseUrl}/generate/remaining`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRemaining(data.remaining);
    } catch (e) {
      setRemaining(null);
    } finally { setLimitInfoLoading(false); }
  };

  useEffect(() => { fetchRemaining(); }, []);

  const saveRecentTopic = (t) => {
    try {
      const next = [t, ...recentTopics.filter(x => x !== t)].slice(0, 8);
      setRecentTopics(next);
      localStorage.setItem('recentTopics', JSON.stringify(next));
    } catch {}
  };

  const handleGenerate = async () => {
    if (remaining === 0) {
      setShowNoQuotaModal(true);
      return;
    }
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setError('');
    setLoading(true);
    const ctrl = new AbortController();
    setAbortCtrl(ctrl);
    try {
      const response = await fetch(`${baseUrl}/generate/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        },
        body: JSON.stringify({
          topic: topic,
          language: language,
          difficulty: difficulty
        }),
        signal: ctrl.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          setRemaining(0);
          setShowNoQuotaModal(true);
          return;
        }
        throw new Error('Generation failed');
      }
      const data = await response.json();
      // data now includes id, title, language, difficulty, questions
      setRemaining(prev => prev === null ? null : Math.max(0, prev - 1));

      // Immediately create an initial score attempt (progressive saving)
      let scoreRecord = null;
      try {
        const initRes = await fetch(`${baseUrl}/scores/${data.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || ''
          },
          body: JSON.stringify({
            score: 0,
            max_score: (data.questions || []).length || 0,
            answers: {}
          })
        });
        if (initRes.ok) {
          scoreRecord = await initRes.json();
        }
      } catch (e) { console.error('Initial score create failed', e); }

      const quiz = {
        id: data.id,
        title: data.title,
        language: data.language,
        difficulty: data.difficulty,
        questions: data.questions
      };
      onGenerate(quiz, scoreRecord?.id);
      saveRecentTopic(topic.trim());
    } catch (error) {
      if (error?.name === 'AbortError') return; // silently ignore
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
      setAbortCtrl(null);
    }
  };

  const handleCancel = () => {
    try { abortCtrl?.abort(); } catch {}
    setLoading(false);
    setAbortCtrl(null);
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
    <div className="w-full max-w-lg glass-card p-8 rounded-2xl" data-testid="quiz-generator" role="form" aria-labelledby="generator-heading">
      {/* Remaining quota display */}
      <div className="flex justify-end mb-4">
        <div className="text-sm text-gray-600">
          {limitInfoLoading ? 'Checking quota...' : (remaining === null ? 'Quota: —' : `Remaining: ${remaining}/5`)}
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 id="generator-heading" className="text-2xl font-bold text-gray-800 mb-2">Create New Quiz</h2>
        <p className="text-gray-600">Generate an AI-powered quiz on any topic</p>
      </div>

      <div className="space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            📚 Quiz Topic
          </label>
          <input
            id="topic"
            type="text"
            placeholder="e.g., World History, JavaScript, Biology..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleGenerate(); }}
            className="form-input"
            aria-describedby={error ? 'topic-error' : undefined}
          />
          {error && (
            <p id="topic-error" role="alert" className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Quick Suggestions */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">✨ Quick suggestions</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTopic(s)}
                className="px-3 py-1 rounded-full border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs"
                aria-label={`Use suggested topic ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Topics */}
        {recentTopics.length > 0 && (
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">🕘 Recent topics</div>
            <div className="flex flex-wrap gap-2">
              {recentTopics.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="px-3 py-1 rounded-full border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs"
                  aria-label={`Use recent topic ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ⚡ Difficulty Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                aria-pressed={difficulty === level}
                aria-label={`Set difficulty ${level}`}
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
            aria-label="Select quiz language"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Generate / Cancel Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className={`btn-primary flex-1 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="loading-spinner" aria-hidden="true"></div>
                <span>Generating Quiz...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span aria-hidden="true">✨</span>
                <span>Generate Quiz</span>
              </div>
            )}
          </button>
          {loading && (
            <button type="button" onClick={handleCancel} className="btn-ghost px-4 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Additional Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Want more control?</p>
          <Link href="/editor" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            Try Quiz Editor →
          </Link>
        </div>
      </div>

      {/* Full-screen generating overlay */}
      {loading && (
        <GeneratingScreen onCancel={handleCancel} />
      )}

      {/* No quota modal */}
      <ConfirmModal
        isOpen={showNoQuotaModal}
        title="No generations remaining"
        message="You've reached your daily quiz generation limit. Please try again tomorrow."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowNoQuotaModal(false)}
        onCancel={() => setShowNoQuotaModal(false)}
        variant="default"
      />
    </div>
  );
}
