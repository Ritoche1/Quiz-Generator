'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuizGenerator from '@/components/QuizGenerator';
import QuizQuestion from '@/components/QuizQuestion';
import QuizRecap from '@/components/QuizRecap';
import AuthForm from '@/components/AuthForm';
import Skeleton from '@/components/ui/Skeleton';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

function LandingPage({ onLogin }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${baseUrl}/quizzes/stats/global`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats(d))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Generate AI-Powered Quizzes<br className="hidden sm:block" /> in Seconds
          </h1>
          <p className="text-lg sm:text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
            Create, share, and take quizzes on any topic. Powered by Mistral AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const el = document.getElementById('auth-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Get Started
            </button>
            <Link
              href="/browse"
              className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-center"
            >
              Browse Quizzes
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: '1', title: 'Choose a Topic', desc: 'Enter any subject and customize difficulty, language, and question count.' },
            { icon: '2', title: 'AI Generates', desc: 'Mistral AI creates unique, engaging questions tailored to your topic.' },
            { icon: '3', title: 'Learn & Share', desc: 'Take the quiz, track your progress, and challenge your friends.' },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center mx-auto mb-4 text-lg">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600">{stats.totalQuizzes}</div>
                <div className="text-sm text-gray-500 mt-1">Quizzes Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-500 mt-1">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">{stats.avgScore}%</div>
                <div className="text-sm text-gray-500 mt-1">Average Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 truncate">{stats.topicOfTheWeek}</div>
                <div className="text-sm text-gray-500 mt-1">Hot Topic</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth section */}
      <div id="auth-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to start?</h2>
          <p className="text-gray-500">Sign in or create an account to generate quizzes</p>
        </div>
        <div className="flex justify-center">
          <AuthForm onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}

export default function Home({ initialQuiz = null }) {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [user, setUser] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showRecap, setShowRecap] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeState, setResumeState] = useState(null);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [scoreId, setScoreId] = useState(null);
  const router = useRouter();
  const finalizedRef = useRef(null);
  const storageKey = 'inProgressQuiz';

  const computeNextIndex = (answers, total) => {
    if (!total || total <= 0) return 0;
    for (let i = 0; i < total; i++) { if (!(i in answers)) return i; }
    return total - 1;
  };

  // Fetch quiz by URL param
  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const quizId = params?.get('quiz');
    if (!quizId) return;
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/quizzes/${quizId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setQuiz({ id: data.id, title: data.title, language: data.language, difficulty: data.difficulty, questions: data.questions || [] });
        setCurrentQuestionIndex(0); setSelectedAnswers({}); setShowRecap(false); setShowFeedback(false);
        setSessionStreak(0); setScoreId(null);
      } catch { setQuiz(null); }
    })();
  }, []);

  // Auth check
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('quizToken');
    if (token) {
      fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          setUser(data); setIsAuthenticated(true);
          const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const redirectTo = params?.get('redirect');
          if (redirectTo) router.replace(redirectTo);
        })
        .catch(() => { localStorage.removeItem('quizToken'); setUser(null); setIsAuthenticated(false); });
    } else { setUser(null); setIsAuthenticated(false); }
    setLoading(false);
  }, [isAuthenticated, router]);

  // Server resume
  useEffect(() => {
    const tryResume = async () => {
      if (!isAuthenticated || !quiz?.id || showRecap || scoreId) return;
      try {
        const res = await fetch(`${baseUrl}/scores/latest/${quiz.id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } });
        if (!res.ok) return;
        const attempt = await res.json();
        const answers = attempt?.answers || {};
        const total = quiz.questions?.length || 0;
        const nextIdx = computeNextIndex(answers, total);
        setSelectedAnswers(answers); setScoreId(attempt.id);
        if (Object.keys(answers).length >= total && total > 0) setShowRecap(true);
        else { setCurrentQuestionIndex(nextIdx); setShowFeedback(false); }
      } catch {}
    };
    tryResume();
  }, [isAuthenticated, quiz, showRecap, scoreId]);

  // Local resume
  useEffect(() => {
    if (!isAuthenticated || quiz || showRecap) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.quiz?.questions) return;
      const token = localStorage.getItem('quizToken');
      (async () => {
        if (parsed.scoreId && token) {
          try {
            const res = await fetch(`${baseUrl}/scores/attempt/${parsed.scoreId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
              const attempt = await res.json();
              const answers = attempt?.answers || {};
              const total = parsed.quiz.questions.length;
              setQuiz(parsed.quiz); setSelectedAnswers(answers); setScoreId(attempt.id);
              if (Object.keys(answers).length >= total && total > 0) setShowRecap(true);
              else { setCurrentQuestionIndex(computeNextIndex(answers, total)); setShowFeedback(false); }
              setResumeState(null);
              return;
            }
          } catch {}
        }
        setResumeState(parsed);
      })();
    } catch {}
  }, [isAuthenticated, quiz, showRecap]);

  // Persist
  useEffect(() => {
    if (!quiz || showRecap) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ quiz, currentQuestionIndex, selectedAnswers, scoreId })); } catch {}
  }, [quiz, currentQuestionIndex, selectedAnswers, showRecap, scoreId]);

  const handleLogin = () => setIsAuthenticated(true);

  const handleGenerate = (quizData, initialScoreId) => {
    if (!quizData?.questions?.length) { setError('No questions found.'); return; }
    setError(null); setQuiz(quizData); setCurrentQuestionIndex(0); setSelectedAnswers({});
    setShowRecap(false); setShowFeedback(false); setResumeState(null);
    setSessionStreak(0); setScoreId(initialScoreId || null);
  };

  const saveProgress = async (answers, idx, final = false) => {
    if (!isAuthenticated || !quiz?.id || !scoreId) return;
    try {
      const body = { answers };
      if (final) {
        body.score = Object.entries(answers).reduce((acc, [k, v]) => acc + (quiz.questions[Number(k)]?.answer === v ? 1 : 0), 0);
        body.max_score = quiz.questions.length;
      }
      await fetch(`${baseUrl}/scores/${scoreId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || '' },
        body: JSON.stringify(body)
      });
    } catch {}
  };

  useEffect(() => {
    if (!showRecap || !isAuthenticated || !quiz?.id || !scoreId) return;
    if (finalizedRef.current === scoreId) return;
    finalizedRef.current = scoreId;
    saveProgress(selectedAnswers, 0, true);
  }, [showRecap, isAuthenticated, quiz, scoreId, selectedAnswers]);

  const handleAnswer = (answer) => {
    const q = quiz.questions[currentQuestionIndex];
    const correct = answer === q.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setSessionStreak(prev => correct ? prev + 1 : 0);
    setSelectedAnswers(prev => {
      const next = { ...prev, [currentQuestionIndex]: answer };
      setTimeout(() => saveProgress(next, currentQuestionIndex), 0);
      return next;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setIsCorrect(null); setShowFeedback(false);
    } else {
      setShowRecap(true);
      saveProgress(selectedAnswers, currentQuestionIndex, true);
      try { localStorage.removeItem(storageKey); } catch {}
    }
  };

  const handleRestart = () => {
    setQuiz(null); setCurrentQuestionIndex(0); setSelectedAnswers({});
    setShowRecap(false); setShowFeedback(false); setResumeState(null);
    setSessionStreak(0); setScoreId(null);
    try { localStorage.removeItem(storageKey); } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Unauthenticated: show landing page
  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // Authenticated: quiz flow
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      {/* Resume banner */}
      {resumeState && !quiz && (
        <div className="max-w-xl mx-auto mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Resume previous quiz?</p>
                <p className="text-sm text-gray-500">Question {(resumeState.currentQuestionIndex || 0) + 1} of {resumeState.quiz?.questions?.length || 0}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setQuiz(resumeState.quiz);
                      setCurrentQuestionIndex(resumeState.currentQuestionIndex || 0);
                      setSelectedAnswers(resumeState.selectedAnswers || {});
                      setResumeState(null);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >Resume</button>
                  <button
                    onClick={() => { setResumeState(null); try { localStorage.removeItem(storageKey); } catch {} }}
                    className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >Discard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz in progress */}
      {quiz && quiz.questions?.length > 0 && !showRecap ? (
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Question {Math.min(currentQuestionIndex + 1, quiz.questions.length)} of {quiz.questions.length}</span>
              <div className="flex items-center gap-3">
                {sessionStreak > 1 && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Streak: {sessionStreak}</span>
                )}
                <span className="font-medium text-gray-900">
                  {Math.round(((currentQuestionIndex + (showFeedback ? 1 : 0)) / quiz.questions.length) * 100)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + (showFeedback ? 1 : 0)) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <QuizQuestion
            question={quiz.questions[currentQuestionIndex].question}
            options={quiz.questions[currentQuestionIndex].options}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
            correctAnswer={quiz.questions[currentQuestionIndex].answer}
          />

          {showFeedback && (
            <div className="max-w-2xl mx-auto mt-4">
              <button
                onClick={handleNextQuestion}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>
      ) : showRecap ? (
        <QuizRecap quiz={quiz} selectedAnswers={selectedAnswers} onRestart={handleRestart} />
      ) : (
        <>
          <QuizGenerator onGenerate={handleGenerate} />
          {error && <p className="text-red-600 mt-4 text-center text-sm">{error}</p>}
        </>
      )}
    </div>
  );
}
