'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';
import TemplatePickerModal from '@/components/TemplatePickerModal';
import ConfirmModal from '@/components/ConfirmModal';
import { getErrorMessage } from '@/lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Turkish', 'Polish'];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'border-emerald-300 bg-emerald-50 text-emerald-700', activeColor: 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-200' },
  { value: 'medium', label: 'Medium', color: 'border-amber-300 bg-amber-50 text-amber-700', activeColor: 'border-amber-500 bg-amber-100 ring-2 ring-amber-200' },
  { value: 'hard', label: 'Hard', color: 'border-red-300 bg-red-50 text-red-700', activeColor: 'border-red-500 bg-red-100 ring-2 ring-red-200' },
];

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XMarkIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function QuizEditor() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    language: 'English',
    difficulty: 'easy',
    questions: [{ question: '', options: ['', '', '', ''], answer: '' }],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewCurrentQuestion, setPreviewCurrentQuestion] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('quizToken');
    if (token) {
      try {
        const r = await fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (r.ok) setUser(await r.json());
      } catch {}
    }
    setLoading(false);
  };

  // Load quiz from URL param
  useEffect(() => {
    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const loadId = params?.get('load');
      if (!loadId) return;
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`${baseUrl}/quizzes/${loadId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } });
          if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to load requested quiz.'));
          setQuiz(await res.json());
          setCurrentQuestionIndex(0);
        } catch (error) { alert(error?.message || 'Failed to load requested quiz.'); }
        finally { setLoading(false); }
      })();
    } catch {}
  }, []);

  const updateQuizField = (field, value) => setQuiz(prev => ({ ...prev, [field]: value }));

  const updateQuestion = (index, field, value) =>
    setQuiz(prev => ({ ...prev, questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q) }));

  const updateQuestionOption = (questionIndex, optionIndex, value) =>
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) } : q
      ),
    }));

  const addQuestion = () => {
    setQuiz(prev => ({ ...prev, questions: [...prev.questions, { question: '', options: ['', '', '', ''], answer: '' }] }));
    setCurrentQuestionIndex(quiz.questions.length);
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length <= 1) return;
    setQuiz(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
    if (currentQuestionIndex >= quiz.questions.length - 1) setCurrentQuestionIndex(Math.max(0, quiz.questions.length - 2));
  };

  const addOption = (questionIndex) =>
    setQuiz(prev => ({ ...prev, questions: prev.questions.map((q, i) => i === questionIndex ? { ...q, options: [...q.options, ''] } : q) }));

  const removeOption = (questionIndex, optionIndex) => {
    if (quiz.questions[questionIndex].options.length <= 2) return;
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === questionIndex ? { ...q, options: q.options.filter((_, j) => j !== optionIndex) } : q),
    }));
  };

  const saveQuiz = async () => {
    setSaveError('');
    if (!quiz.title.trim()) { setSaveError('Quiz title is required'); return; }
    const validQuestions = quiz.questions.filter(q => q.question.trim() && q.options.every(o => o.trim()) && q.answer.trim());
    if (validQuestions.length === 0) { setSaveError('At least one complete question is required'); return; }

    setSaveStatus('saving');
    try {
      const token = localStorage.getItem('quizToken');
      const res = await fetch(`${baseUrl}/quizzes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description || `A ${quiz.difficulty} quiz in ${quiz.language} with ${validQuestions.length} questions`,
          language: quiz.language,
          difficulty: quiz.difficulty,
          questions: validQuestions,
        }),
      });
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to save quiz.'));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3500);
    } catch (error) {
      setSaveStatus('error');
      setSaveError(error?.message || 'Failed to save quiz.');
      setTimeout(() => setSaveStatus(''), 3500);
    }
  };

  const previewQuiz = () => {
    const valid = quiz.questions.filter(q => q.question.trim() && q.options.every(o => o.trim()) && q.answer.trim());
    if (valid.length === 0) { setSaveError('Complete at least one question before previewing'); return; }
    setPreviewCurrentQuestion(0);
    setPreviewAnswers({});
    setShowPreview(true);
  };

  const closePreview = () => { setShowPreview(false); setPreviewCurrentQuestion(0); setPreviewAnswers({}); };
  const handleSelectTemplate = (tpl) => {
    setQuiz({ title: tpl.title, description: tpl.description || '', language: tpl.language || 'English', difficulty: tpl.difficulty || 'easy', questions: Array.isArray(tpl.questions) ? tpl.questions : [], id: tpl.id });
    setCurrentQuestionIndex(0);
  };

  const confirmStartBlank = () => {
    setQuiz({ title: '', description: '', language: 'English', difficulty: 'easy', questions: [{ question: '', options: ['', '', '', ''], answer: '' }] });
    setCurrentQuestionIndex(0);
    setShowClearModal(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <div className="lg:col-span-2"><Skeleton className="h-96" /></div>
        </div>
      </div>
    );
  }

  // ── Auth required ────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 text-sm mb-6">Please log in to access the quiz editor</p>
          <Link href="/" className="inline-flex px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const validQuestions = quiz.questions.filter(q => q.question.trim() && q.options.every(o => o.trim()) && q.answer.trim());
  const qOk = { text: !!currentQuestion.question.trim(), options: currentQuestion.options.every(o => o.trim()), answer: !!currentQuestion.answer.trim() };

  // ── Main editor ──────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Quiz Editor</h1>
            <p className="text-gray-500 text-sm mt-0.5">Create and customize your own quizzes</p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Load
            </button>

            <button
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Clear
            </button>

            <button
              onClick={previewQuiz}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Preview
            </button>

            <button
              onClick={saveQuiz}
              disabled={saveStatus === 'saving'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  Save Quiz
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Status banners ── */}
        {saveStatus === 'success' && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 mb-6">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm font-medium">Quiz saved successfully!</p>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 mb-6">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-sm font-medium">Failed to save quiz. Please try again.</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 mb-6">
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-sm font-medium">{saveError}</p>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Settings panel ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                Quiz Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quiz-title"
                    type="text"
                    value={quiz.title}
                    onChange={e => updateQuizField('title', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-sm placeholder-gray-400"
                    placeholder="Enter quiz title…"
                  />
                </div>

                <div>
                  <label htmlFor="quiz-desc" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    id="quiz-desc"
                    value={quiz.description}
                    onChange={e => updateQuizField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-sm placeholder-gray-400 resize-none"
                    placeholder="Brief description…"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => updateQuizField('difficulty', d.value)}
                        className={`py-2 rounded-lg border text-xs font-medium transition-all ${quiz.difficulty === d.value ? d.activeColor : d.color}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="quiz-lang" className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                  <select
                    id="quiz-lang"
                    value={quiz.language}
                    onChange={e => updateQuizField('language', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 text-sm transition-colors"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Question list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Questions <span className="text-gray-400 font-normal">({quiz.questions.length})</span>
                </h3>
                <button
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {quiz.questions.map((q, index) => {
                  const isComplete = q.question.trim() && q.options.every(o => o.trim()) && q.answer.trim();
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between gap-2 group ${
                        index === currentQuestionIndex
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          index === currentQuestionIndex ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-xs text-gray-600 truncate">
                          {q.question.trim() ? q.question.substring(0, 32) + (q.question.length > 32 ? '…' : '') : 'Untitled question'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {quiz.questions.length > 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); removeQuestion(index); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                            aria-label="Remove question"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {validQuestions.length > 0 && (
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  {validQuestions.length} of {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} complete
                </p>
              )}
            </div>
          </div>

          {/* ── Right: Question editor ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Question header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">of {quiz.questions.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Question text */}
              <div>
                <label htmlFor="q-text" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Question text <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="q-text"
                  value={currentQuestion.question}
                  onChange={e => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-sm placeholder-gray-400 resize-none"
                  placeholder="Enter your question here…"
                />
              </div>

              {/* Answer options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Answer options <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">— select the correct one</span>
                  </label>
                  <button
                    onClick={() => addOption(currentQuestionIndex)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add option
                  </button>
                </div>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const isCorrect = currentQuestion.answer === option && option.trim();
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isCorrect
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Letter badge */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {letter}
                        </div>

                        <input
                          type="text"
                          value={option}
                          onChange={e => updateQuestionOption(currentQuestionIndex, index, e.target.value)}
                          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
                          placeholder={`Option ${letter}…`}
                        />

                        {/* Mark correct */}
                        <button
                          onClick={() => updateQuestion(currentQuestionIndex, 'answer', option)}
                          title={isCorrect ? 'Correct answer' : 'Mark as correct'}
                          className={`p-1.5 rounded-lg transition-all shrink-0 ${
                            isCorrect
                              ? 'text-emerald-600 bg-emerald-100'
                              : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>

                        {/* Remove option */}
                        {currentQuestion.options.length > 2 && (
                          <button
                            onClick={() => removeOption(currentQuestionIndex, index)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                            aria-label={`Remove option ${letter}`}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status checklist */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Question status</p>
                <div className="space-y-2">
                  {[
                    { ok: qOk.text, label: 'Question text filled in' },
                    { ok: qOk.options, label: 'All options filled in' },
                    { ok: qOk.answer, label: 'Correct answer selected' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.ok ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {item.ok
                          ? <CheckIcon className="w-3 h-3 text-emerald-600" />
                          : <XMarkIcon className="w-3 h-3 text-red-500" />}
                      </span>
                      <span className={`text-sm ${item.ok ? 'text-gray-700' : 'text-gray-500'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview modal ── */}
      {showPreview && (() => {
        const validQs = quiz.questions.filter(q => q.question.trim() && q.options.every(o => o.trim()) && q.answer.trim());
        const pq = validQs[previewCurrentQuestion];
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closePreview}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="font-display font-bold text-gray-900">{quiz.title || 'Quiz Preview'}</h2>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{quiz.difficulty} · {quiz.language}</p>
                </div>
                <button onClick={closePreview} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" aria-label="Close preview">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Question {previewCurrentQuestion + 1} of {validQs.length}</span>
                    <span className="font-medium">{Math.round(((previewCurrentQuestion + 1) / validQs.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-300"
                      style={{ width: `${((previewCurrentQuestion + 1) / validQs.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question card */}
                <div className="mb-6">
                  <h4 className="font-display font-semibold text-gray-900 text-lg mb-5 text-center leading-snug">{pq.question}</h4>
                  <div className="space-y-3">
                    {pq.options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const selected = previewAnswers[previewCurrentQuestion] === opt;
                      return (
                        <button
                          key={i}
                          onClick={() => setPreviewAnswers(prev => ({ ...prev, [previewCurrentQuestion]: opt }))}
                          className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all duration-150 ${
                            selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            selected ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {letter}
                          </div>
                          <span className={`text-sm ${selected ? 'text-indigo-800 font-medium' : 'text-gray-700'}`}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPreviewCurrentQuestion(p => Math.max(0, p - 1))}
                    disabled={previewCurrentQuestion === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => {
                      if (previewCurrentQuestion < validQs.length - 1) setPreviewCurrentQuestion(p => p + 1);
                      else closePreview();
                    }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all shadow-sm"
                  >
                    {previewCurrentQuestion >= validQs.length - 1 ? 'Close Preview' : 'Next →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <TemplatePickerModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleSelectTemplate}
        apiBase={baseUrl}
      />
      <ConfirmModal
        isOpen={showClearModal}
        title="Start from blank?"
        message="This will clear the current quiz in the editor. This action cannot be undone."
        confirmText="Yes, clear"
        onConfirm={confirmStartBlank}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
}
