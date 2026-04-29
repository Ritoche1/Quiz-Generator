'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { generateReportPDF, generateWorksheetPDF } from '@/lib/pdf';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

function ScoreRing({ percentage }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 80 ? '#059669' : percentage >= 50 ? '#D97706' : '#DC2626';

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          className="score-ring-animated"
          style={{
            strokeDasharray: circumference,
            '--circumference': circumference,
            '--target-offset': offset,
            strokeDashoffset: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
}

export default function QuizRecap({ quiz, selectedAnswers, onRestart }) {
  const didMountRef = useRef(false);
  const [showingReport, setShowingReport] = useState(false);
  const [generateStatus, setGenerateStatus] = useState('');
  const [globalStats, setGlobalStats] = useState(null);
  const [attemptsCount, setAttemptsCount] = useState(null);

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((q, i) => { if (selectedAnswers[i] === q.answer) score++; });
    return score;
  };

  const score = calculateScore();
  const total = quiz.questions.length;
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage >= 90) return 'Outstanding!';
    if (percentage >= 70) return 'Great job!';
    if (percentage >= 50) return 'Good effort!';
    return 'Keep learning!';
  };

  const generateQuizReport = async () => {
    setGenerateStatus('generating');
    try { await generateReportPDF(quiz, selectedAnswers); setGenerateStatus(''); }
    catch { setGenerateStatus('error'); setTimeout(() => setGenerateStatus(''), 3000); }
  };

  const generateEmptyQuiz = async () => {
    setGenerateStatus('generating-empty');
    try { await generateWorksheetPDF(quiz); setGenerateStatus(''); }
    catch { setGenerateStatus('error'); setTimeout(() => setGenerateStatus(''), 3000); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/?quiz=${quiz.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiBase}/quizzes/stats/global`);
        if (res.ok && mounted) setGlobalStats(await res.json());
        if (quiz?.id) {
          const r2 = await fetch(`${apiBase}/quizzes/${quiz.id}/scores/count`);
          if (r2.ok && mounted) { const d = await r2.json(); setAttemptsCount(d.attempts ?? d.count ?? 0); }
        }
      } catch {}
    };
    fetchStats();
    return () => { mounted = false; };
  }, [quiz?.id]);

  if (showingReport) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Detailed Breakdown</h2>
            <button onClick={() => setShowingReport(false)} className="text-sm text-indigo-600 hover:underline font-medium">
              Back to summary
            </button>
          </div>
          <div className="space-y-4">
            {quiz.questions.map((q, i) => {
              const correct = selectedAnswers[i] === q.answer;
              return (
                <div key={i} className={`p-5 rounded-xl border-l-4 ${correct ? 'border-emerald-500 bg-emerald-50/50' : 'border-red-500 bg-red-50/50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Question {i + 1}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 mb-3">{q.question}</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-gray-500">Your answer:</span>
                      <span className={correct ? 'text-emerald-700 font-medium' : 'text-red-700 font-medium'}>
                        {selectedAnswers[i] || 'No answer'}
                      </span>
                    </div>
                    {!correct && (
                      <div className="flex gap-2">
                        <span className="text-gray-500">Correct:</span>
                        <span className="text-emerald-700 font-medium">{q.answer}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* Score ring */}
        <div className="text-center mb-8">
          <ScoreRing percentage={percentage} />
          <h2 className="font-display text-2xl font-bold text-gray-900 mt-4">{getMessage()}</h2>
          <p className="text-gray-500 mt-1">
            You got <span className="font-semibold text-gray-900">{score}</span> out of <span className="font-semibold text-gray-900">{total}</span> correct
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <div className="text-xl font-bold text-emerald-700">{score}</div>
            <div className="text-xs text-emerald-600">Correct</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <div className="text-xl font-bold text-red-700">{total - score}</div>
            <div className="text-xs text-red-600">Incorrect</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-xl font-bold text-gray-700">{attemptsCount ?? '-'}</div>
            <div className="text-xs text-gray-500">Attempts</div>
          </div>
        </div>

        {/* Quiz info */}
        <div className="flex items-center justify-center gap-4 mb-8 text-sm text-gray-500">
          <span className="capitalize">{quiz.difficulty}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{quiz.language}</span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowingReport(true)}
              className="py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Breakdown
            </button>
            <button
              onClick={handleShare}
              className="py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Share Quiz
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={generateQuizReport}
              disabled={generateStatus === 'generating'}
              className="py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {generateStatus === 'generating' ? 'Generating...' : 'PDF Report'}
            </button>
            <button
              onClick={generateEmptyQuiz}
              disabled={generateStatus === 'generating-empty'}
              className="py-2.5 px-4 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {generateStatus === 'generating-empty' ? 'Generating...' : 'PDF Worksheet'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRestart}
              className="py-2.5 px-4 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white transition-all shadow-sm hover:shadow-md"
            >
              New Quiz
            </button>
            <Link
              href="/browse"
              className="py-2.5 px-4 text-sm font-medium rounded-xl border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors text-center"
            >
              Browse More
            </Link>
          </div>
        </div>

        {generateStatus === 'error' && (
          <p className="text-sm text-red-600 text-center mt-3">Failed to generate PDF. Please try again.</p>
        )}
      </div>
    </div>
  );
}
