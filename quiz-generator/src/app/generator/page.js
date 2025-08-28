'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import QuizGenerator from '@/components/QuizGenerator';
import QuizQuestion from '@/components/QuizQuestion';
import QuizRecap from '@/components/QuizRecap';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function GeneratorPage({ initialQuiz = null}) {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [user, setUser] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showRecap, setShowRecap] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [bgClass, setBgClass] = useState('bg-default');
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resumeState, setResumeState] = useState(null);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [scoreId, setScoreId] = useState(null);
  const router = useRouter();
  const finalizedRef = useRef(null);

  // Key for storing in-progress session
  const storageKey = 'inProgressQuiz';

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const ydayKey = () => {
    const d = new Date();
    d.setDate(d.getDate()-1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const loadDailyStreak = () => {
    try {
      const raw = localStorage.getItem('dailyStreak');
      if (!raw) return { count: 0, lastDate: null };
      return JSON.parse(raw);
    } catch { return { count: 0, lastDate: null }; }
  };
  const saveDailyStreak = (s) => { try { localStorage.setItem('dailyStreak', JSON.stringify(s)); } catch {} };

  // Helper: compute next question index from saved answers
  const computeNextIndex = (answers, total) => {
    if (!total || total <= 0) return 0;
    for (let i = 0; i < total; i++) {
      if (!(i in answers)) return i;
    }
    return total - 1; // all answered -> will show recap
  };

  useEffect(() => {
    const s = loadDailyStreak();
    setDailyStreak(s?.count || 0);
  }, []);

  // Fetch a quiz by id from URL param (e.g., /generator?quiz=123)
  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const quizId = params?.get('quiz');
    if (!quizId) return;

    const fetchQuizById = async (id) => {
      try {
        const res = await fetch(`${baseUrl}/quizzes/${id}`);
        if (!res.ok) throw new Error('Failed to fetch quiz');
        const data = await res.json();
        // Normalize shape for the player
        setQuiz({
          id: data.id,
          title: data.title,
          language: data.language,
          difficulty: data.difficulty,
          questions: data.questions || [],
        });
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setShowRecap(false);
        setIsCorrect(null);
        setShowFeedback(false);
        setBgClass('bg-default');
        setSessionStreak(0);
        setScoreId(null); // Reset scoreId for a fresh attempt
      } catch (e) {
        console.error('Error loading quiz from URL param:', e);
        // If loading the quiz fails, clear the param-driven state
        setQuiz(null);
      }
    };

    fetchQuizById(quizId);
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('quizToken');
    if (token) {
        fetch(`${baseUrl}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Not authenticated');
            }
            return response.json();
        })
        .then(data => {
            setUser(data);
            setIsAuthenticated(true);
        })
        .catch(error => {
            // Clear invalid token
            localStorage.removeItem('quizToken');
            setUser(null);
            setIsAuthenticated(false);
            // Redirect to home if not authenticated
            router.push('/');
        });
    } else {
        setUser(null);
        setIsAuthenticated(false);
        // Redirect to home if not authenticated
        router.push('/');
    }
    setLoading(false);
  }, [isAuthenticated, router]);

  // Prefer server resume: when authenticated and we have a quiz, fetch latest attempt for that quiz
  useEffect(() => {
    const tryServerResumeForQuiz = async () => {
      if (!isAuthenticated || !quiz?.id || showRecap || scoreId) return;
      try {
        const res = await fetch(`${baseUrl}/scores/latest/${quiz.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` }
        });
        if (!res.ok) return; // no server attempt
        const attempt = await res.json();
        const answers = attempt?.answers || {};
        const total = quiz.questions?.length || 0;
        const nextIdx = computeNextIndex(answers, total);
        setSelectedAnswers(answers);
        setScoreId(attempt.id);
        // If everything answered, go to recap
        if (Object.keys(answers).length >= total && total > 0) {
          setShowRecap(true);
        } else {
          setCurrentQuestionIndex(nextIdx);
          setShowFeedback(false);
          setIsCorrect(null);
          setBgClass('bg-default');
        }
      } catch (e) {
        console.error('Server resume (latest) failed:', e);
      }
    };
    tryServerResumeForQuiz();
  }, [isAuthenticated, quiz, showRecap, scoreId]);

  // Load any in-progress state once authenticated and not currently in a quiz.
  // Prefer server over localStorage: if local storage has a scoreId, try fetching it from server and auto-resume.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (quiz || showRecap) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.quiz || !Array.isArray(parsed.quiz.questions)) return;

      const token = localStorage.getItem('quizToken');
      const tryServer = async () => {
        if (parsed.scoreId && token) {
          try {
            const res = await fetch(`${baseUrl}/scores/attempt/${parsed.scoreId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const attempt = await res.json();
              const answers = attempt?.answers || {};
              const total = parsed.quiz.questions?.length || 0;
              const nextIdx = computeNextIndex(answers, total);
              setQuiz(parsed.quiz);
              setSelectedAnswers(answers);
              setScoreId(attempt.id);
              if (Object.keys(answers).length >= total && total > 0) {
                setShowRecap(true);
              } else {
                setCurrentQuestionIndex(nextIdx);
                setShowFeedback(false);
                setIsCorrect(null);
                setBgClass('bg-default');
              }
              setResumeState(null); // auto-resume; no prompt
              return;
            }
          } catch (e) {
            console.error('Server resume (by scoreId) failed:', e);
          }
        }
        // Fallback: keep previous behavior (show resume prompt based on localStorage)
        setResumeState(parsed);
      };
      tryServer();
    } catch {}
  }, [isAuthenticated, quiz, showRecap]);

  // Persist in-progress state when answering or navigating
  useEffect(() => {
    if (!quiz || showRecap) return;
    try {
      const payload = JSON.stringify({ quiz, currentQuestionIndex, selectedAnswers, scoreId });
      localStorage.setItem(storageKey, payload);
    } catch {}
  }, [quiz, currentQuestionIndex, selectedAnswers, showRecap, scoreId]);
  
  const handleGenerate = (quizData, initialScoreId) => {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      setError('No questions found. Please try again.');
      return;
    }
    setError(null);
    setQuiz(quizData);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowRecap(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setBgClass('bg-default');
    setResumeState(null);
    setSessionStreak(0);
    setScoreId(initialScoreId || null);
  };

  // Progressive save helper
  const saveProgress = async (answers, idx, final = false) => {
    if (!isAuthenticated || !quiz?.id || !scoreId) return; // only when we have a server score record
    try {
      const url = `${baseUrl}/scores/${scoreId}`;
      const body = {
        answers: answers,
      };
      if (final) {
        body.score = Object.entries(answers).reduce((acc, [k, v]) => acc + (quiz.questions[Number(k)]?.answer === v ? 1 : 0), 0);
        body.max_score = quiz.questions.length;
      }
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || ''
        },
        body: JSON.stringify(body)
      });
    } catch (e) { console.error('Progress save failed', e); }
  };

  // If we auto-resume and land directly on recap (all answers present), finalize once on server
  useEffect(() => {
    if (!showRecap || !isAuthenticated || !quiz?.id || !scoreId) return;
    if (finalizedRef.current === scoreId) return;
    finalizedRef.current = scoreId;
    try {
      // Do not update daily streak here; only ensure server has final score
      saveProgress(selectedAnswers, 0, true);
    } catch {}
  }, [showRecap, isAuthenticated, quiz, scoreId, selectedAnswers]);
  
  const handleAnswer = (answer) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswerCorrect = answer === currentQuestion.answer;
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);
    setBgClass(isAnswerCorrect ? 'bg-correct' : 'bg-incorrect');
    setSessionStreak(prev => isAnswerCorrect ? prev + 1 : 0);
    
    setSelectedAnswers((prev) => {
      const next = { ...prev, [currentQuestionIndex]: answer };
      // Save progress after updating
      setTimeout(() => saveProgress(next, currentQuestionIndex), 0);
      return next;
    });
  };
  
  const updateDailyStreakOnFinish = () => {
    const info = loadDailyStreak();
    const today = todayKey();
    const yday = ydayKey();
    let next = { count: 1, lastDate: today };
    if (info?.lastDate === today) {
      next = { count: info.count || 1, lastDate: today };
    } else if (info?.lastDate === yday) {
      next = { count: (info.count || 0) + 1, lastDate: today };
    }
    saveDailyStreak(next);
    setDailyStreak(next.count || 0);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setIsCorrect(null);
      setShowFeedback(false);
      setBgClass('bg-default');
    } else {
      updateDailyStreakOnFinish();
      setShowRecap(true);
      // Finalize score on server
      saveProgress(selectedAnswers, currentQuestionIndex, true);
      try { localStorage.removeItem(storageKey); } catch {}
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
    setResumeState(null);
    setSessionStreak(0);
    setScoreId(null);
    try { localStorage.removeItem(storageKey); } catch {}
  };

  const handleRedoQuiz = (quizData) => {
    setQuiz({
        title: quizData.title,
        language: quizData.language,
        difficulty: 'redo',
        questions: quizData.questions.map(q => ({
            question: q.question,
            options: q.options,
            answer: q.answer
        })),
        id : quizData.id
    });
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowRecap(false);
    setIsCorrect(null);
    setShowFeedback(false);
    setBgClass('bg-default');
    setResumeState(null);
    setSessionStreak(0);
    setScoreId(null); // Reset scoreId for a fresh attempt
    try { localStorage.removeItem(storageKey); } catch {}
};

  const resumeBanner = useMemo(() => {
    if (!resumeState || quiz) return null;
    try {
      const total = resumeState.quiz?.questions?.length || 0;
      const idx = resumeState.currentQuestionIndex || 0;
      return (
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg text-gray-900 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⏸️</div>
            <div className="flex-1">
              <div className="font-semibold">Resume previous quiz?</div>
              <div className="text-sm text-gray-700">You were on question {idx + 1} of {total}.</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setQuiz(resumeState.quiz);
                    setCurrentQuestionIndex(resumeState.currentQuestionIndex || 0);
                    setSelectedAnswers(resumeState.selectedAnswers || {});
                    setResumeState(null);
                  }}
                  className="btn-primary px-3 py-2 text-sm"
                >Resume</button>
                <button
                  onClick={() => { setResumeState(null); try { localStorage.removeItem(storageKey); } catch {} }}
                  className="btn-ghost-light px-3 py-2 text-sm"
                >Discard</button>
              </div>
            </div>
          </div>
        </div>
      );
    } catch { return null; }
  }, [resumeState, quiz]);

  const progressUI = useMemo(() => {
    if (!quiz || showRecap) return null;
    const total = quiz.questions?.length || 0;
    const answered = Math.min(currentQuestionIndex + (showFeedback ? 1 : 0), total);
    const pct = total ? Math.round((answered / total) * 100) : 0;
    return (
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-lg p-3 mb-4 text-gray-900 shadow">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Question {Math.min(currentQuestionIndex + 1, total)} / {total}</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" aria-label="Progress bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">🔥 Streak: {sessionStreak}</span>
          <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">📅 Daily: {dailyStreak}</span>
        </div>
      </div>
    );
  }, [quiz, showRecap, currentQuestionIndex, showFeedback, sessionStreak, dailyStreak]);
  
  if (loading) return <div className="min-h-screen bg-default flex items-center justify-center">Loading...</div>;
  
  if (!isAuthenticated) {
    return null; // Will be redirected to home
  }

  return (
    <div className={`min-h-screen gradient-bg ${bgClass}`}>
      <div className="main-container">
        {/* Top daily streak chip when idle */}
        {!quiz && (
          <div className="w-full max-w-md mb-4 flex justify-end">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-indigo-700 text-sm shadow">📅 Daily streak: {dailyStreak}</span>
          </div>
        )}
        {resumeBanner}
        {quiz && quiz.questions && quiz.questions.length > 0 && !showRecap ? (
          <>
            {progressUI}
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
        ) : (
          <>
            <QuizGenerator onGenerate={handleGenerate} />
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}