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
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="orb-a absolute -top-40 -right-24 w-[480px] h-[480px] bg-purple-500/25 rounded-full blur-3xl" />
          <div className="orb-b absolute -bottom-32 -left-24 w-[400px] h-[400px] bg-indigo-400/25 rounded-full blur-3xl" />
          <div className="orb-a absolute top-1/3 left-1/3 w-64 h-64 bg-violet-400/15 rounded-full blur-2xl" style={{ animationDelay: '2s' }} />
          {/* Dot grid overlay */}
          <div className="dot-grid absolute inset-0" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          {/* AI badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Powered by Mistral AI
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.08] tracking-tight">
            Generate Quizzes
            <br />
            <span className="gradient-text">in Seconds</span>
          </h1>

          <p className="text-lg sm:text-xl text-indigo-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, share, and take AI-powered quizzes on any topic.
            Challenge yourself and compete with friends.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const el = document.getElementById('auth-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all duration-200 shadow-2xl hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              Get Started Free →
            </button>
            <Link
              href="/browse"
              className="px-8 py-4 border-2 border-white/25 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-200 text-center text-base"
            >
              Browse Quizzes
            </Link>
          </div>
        </div>

        {/* Wave transition */}
        <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 48L1440 48L1440 12C1080 48 360 0 0 36L0 48Z" fill="#F7F6F2" />
          </svg>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500 max-w-md mx-auto">Three simple steps to your perfect quiz</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              ),
              iconBg: 'bg-indigo-100',
              iconColor: 'text-indigo-600',
              title: 'Choose a Topic',
              desc: 'Enter any subject and customize difficulty, language, and question count.',
            },
            {
              step: '02',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
              ),
              iconBg: 'bg-violet-100',
              iconColor: 'text-violet-600',
              title: 'AI Generates',
              desc: 'Mistral AI crafts unique, engaging questions perfectly tailored to your topic.',
            },
            {
              step: '03',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              ),
              iconBg: 'bg-purple-100',
              iconColor: 'text-purple-600',
              title: 'Learn & Share',
              desc: 'Take the quiz, track your progress on the leaderboard, and challenge your friends.',
            },
          ].map((f, i) => (
            <div key={i} className="card-lift group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-5">
                <div className={`w-12 h-12 ${f.iconBg} ${f.iconColor} rounded-xl flex items-center justify-center`}>
                  {f.icon}
                </div>
                <span className="font-display text-4xl font-bold text-gray-100 select-none">{f.step}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="relative bg-gray-950 text-white overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute -top-32 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">By the numbers</p>
              <h2 className="font-display text-2xl font-bold text-white/90">Trusted by learners worldwide</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { value: stats.totalQuizzes, label: 'Quizzes Created', gradient: 'from-indigo-400 to-violet-400' },
                { value: stats.totalUsers, label: 'Active Users', gradient: 'from-violet-400 to-purple-400' },
                { value: `${stats.avgScore}%`, label: 'Average Score', gradient: 'from-purple-400 to-pink-400' },
                { value: stats.topicOfTheWeek, label: 'Hot Topic', gradient: 'from-pink-400 to-orange-400', truncate: true },
              ].map((s, i) => (
                <div key={i} className="p-4">
                  <div className={`font-display font-bold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent ${s.truncate ? 'text-xl truncate' : 'text-4xl'}`}>
                    {s.value}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth section */}
      <div id="auth-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Ready to start?</h2>
          <p className="text-gray-500">Sign in or create an account — it&apos;s free</p>
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

        if (Object.keys(answers).length >= total && total > 0) {
          // Previous attempt is complete — create a fresh score record for the retake
          try {
            const initRes = await fetch(`${baseUrl}/scores/${quiz.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || '' },
              body: JSON.stringify({ score: 0, max_score: total, answers: {} }),
            });
            if (initRes.ok) setScoreId((await initRes.json()).id);
          } catch {}
        } else {
          // Incomplete attempt — resume where they left off
          const nextIdx = computeNextIndex(answers, total);
          setSelectedAnswers(answers);
          setScoreId(attempt.id);
          setCurrentQuestionIndex(nextIdx);
          setShowFeedback(false);
        }
      } catch {}
    };
    tryResume();
  }, [isAuthenticated, quiz, showRecap, scoreId]);

  // Local resume — always shows the banner so the user explicitly chooses to continue
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
              if (Object.keys(answers).length >= total && total > 0) {
                // Completed attempt saved in localStorage — clear it, nothing to resume
                try { localStorage.removeItem(storageKey); } catch {}
                return;
              }
              // Sync with server state then show banner
              setResumeState({
                quiz: parsed.quiz,
                currentQuestionIndex: computeNextIndex(answers, total),
                selectedAnswers: answers,
                scoreId: attempt.id,
              });
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

  // Exit mid-quiz and return to the generator — progress stays in localStorage
  const handlePause = () => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowFeedback(false);
    setIsCorrect(null);
    setSessionStreak(0);
    setScoreId(null);
    // The local resume effect will read localStorage and show the banner
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
          <div className="bg-white rounded-xl border border-indigo-100 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  Continue &ldquo;{resumeState.quiz?.title || 'quiz'}&rdquo;?
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {Object.keys(resumeState.selectedAnswers || {}).length} of {resumeState.quiz?.questions?.length || 0} answered
                  {' · '}at question {(resumeState.currentQuestionIndex || 0) + 1}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setQuiz(resumeState.quiz);
                      setCurrentQuestionIndex(resumeState.currentQuestionIndex || 0);
                      setSelectedAnswers(resumeState.selectedAnswers || {});
                      setScoreId(resumeState.scoreId || null);
                      setResumeState(null);
                    }}
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 shadow-sm transition-all"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => { setResumeState(null); try { localStorage.removeItem(storageKey); } catch {} }}
                    className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Start over
                  </button>
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
          <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm mb-2.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                  title="Save progress and exit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                  </svg>
                  Exit
                </button>
                <span className="text-gray-200 select-none">|</span>
                <span className="text-gray-500 font-medium">
                  Q{Math.min(currentQuestionIndex + 1, quiz.questions.length)}
                  <span className="text-gray-300"> / {quiz.questions.length}</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {sessionStreak > 1 && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    🔥 {sessionStreak}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(((currentQuestionIndex + (showFeedback ? 1 : 0)) / quiz.questions.length) * 100)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
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
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
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
