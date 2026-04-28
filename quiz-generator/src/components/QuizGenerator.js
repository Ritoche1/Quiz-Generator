'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import GeneratingScreen from './GeneratingScreen';
import Modal from './ui/Modal';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'border-emerald-300 bg-emerald-50 text-emerald-700', activeColor: 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200' },
  { value: 'medium', label: 'Medium', color: 'border-amber-300 bg-amber-50 text-amber-700', activeColor: 'border-amber-500 bg-amber-100 ring-2 ring-amber-200' },
  { value: 'hard', label: 'Hard', color: 'border-red-300 bg-red-50 text-red-700', activeColor: 'border-red-500 bg-red-100 ring-2 ring-red-200' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function QuizGenerator({ onGenerate }) {
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Turkish', 'Polish'];
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState(languages[0]);
  const [difficulty, setDifficulty] = useState('easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [abortCtrl, setAbortCtrl] = useState(null);
  const [recentTopics, setRecentTopics] = useState([]);
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(null);
  const [limitInfoLoading, setLimitInfoLoading] = useState(false);
  const [showNoQuotaModal, setShowNoQuotaModal] = useState(false);

  const suggestions = useMemo(() => (
    ['World History', 'JavaScript Basics', 'Photosynthesis', 'French Verbs', 'US Geography', 'Data Structures', 'Space Exploration', 'Human Biology']
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
    } catch { setRemaining(null); }
    finally { setLimitInfoLoading(false); }
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
    if (remaining === 0) { setShowNoQuotaModal(true); return; }
    if (!topic.trim()) { setError('Please enter a topic.'); return; }
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
        body: JSON.stringify({ topic, language, difficulty, num_questions: questionCount }),
        signal: ctrl.signal,
      });
      if (!response.ok) {
        if (response.status === 429) { setRemaining(0); setShowNoQuotaModal(true); return; }
        throw new Error('Generation failed');
      }
      const data = await response.json();
      setRemaining(prev => prev === null ? null : Math.max(0, prev - 1));

      let scoreRecord = null;
      try {
        const initRes = await fetch(`${baseUrl}/scores/${data.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || '' },
          body: JSON.stringify({ score: 0, max_score: (data.questions || []).length || 0, answers: {} })
        });
        if (initRes.ok) scoreRecord = await initRes.json();
      } catch {}

      onGenerate({
        id: data.id, title: data.title, language: data.language,
        difficulty: data.difficulty, questions: data.questions
      }, scoreRecord?.id);
      saveRecentTopic(topic.trim());
    } catch (error) {
      if (error?.name === 'AbortError') return;
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

  return (
    <>
      <div className="w-full max-w-xl mx-auto" data-testid="quiz-generator">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-1.5">Create a Quiz</h2>
            <p className="text-gray-500 text-sm">Generate an AI-powered quiz on any topic</p>
            {remaining !== null && (
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-indigo-50 rounded-full">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                <p className="text-xs text-indigo-600 font-medium">
                  {remaining} generation{remaining !== 1 ? 's' : ''} remaining today
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Topic */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                id="topic"
                type="text"
                placeholder="e.g., World History, JavaScript, Biology..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !loading) handleGenerate(); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-lg placeholder-gray-400"
              />
              {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Recent */}
            {recentTopics.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Recent</p>
                <div className="flex flex-wrap gap-2">
                  {recentTopics.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTopic(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      difficulty === d.value ? d.activeColor : d.color
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
              <div className="flex gap-2">
                {QUESTION_COUNTS.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      questionCount === n
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 transition-colors appearance-none bg-[url('data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2020%2020%27%3e%3cpath%20stroke=%27%236b7280%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27m6%208%204%204%204-4%27/%3e%3c/svg%3e')] bg-[position:right_0.75rem_center] bg-[length:1.5em_1.5em] bg-no-repeat pr-10"
              >
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              Generate Quiz
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link href="/editor" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Want more control? Try the Quiz Editor
            </Link>
          </div>
        </div>
      </div>

      {loading && <GeneratingScreen onCancel={handleCancel} />}

      {showNoQuotaModal && (
        <Modal isOpen={showNoQuotaModal} onClose={() => setShowNoQuotaModal(false)} title="Generation Limit Reached">
          <p className="text-gray-600 mb-4">You&apos;ve used all your quiz generations for today. Come back tomorrow for more!</p>
          <button onClick={() => setShowNoQuotaModal(false)} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            OK
          </button>
        </Modal>
      )}
    </>
  );
}
