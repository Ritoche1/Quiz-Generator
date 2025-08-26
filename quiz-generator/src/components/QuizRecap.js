'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { generateReportPDF, generateWorksheetPDF } from '@/lib/pdf';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')}` : 'http://localhost:5000';
const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

export default function QuizRecap({ quiz, selectedAnswers, onRestart }) {
  const didMountRef = useRef(false);
  const [showingReport, setShowingReport] = useState(false);
  const [generateStatus, setGenerateStatus] = useState('');
  // États pour les statistiques (déplacés à l'intérieur du composant)
  const [globalStats, setGlobalStats] = useState(null);
  const [attemptsCount, setAttemptsCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const calculateScore = () => {
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        score++;
      }
    });
    return score;
  };

  const getScorePercentage = () => {
    return Math.round((calculateScore() / quiz.questions.length) * 100);
  };

  const getPerformanceColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return '🎉 Excellent! Outstanding performance!';
    if (percentage >= 80) return '👏 Great job! Well done!';
    if (percentage >= 60) return '👍 Good work! Keep it up!';
    if (percentage >= 40) return '💪 Not bad! Room for improvement!';
    return '📚 Keep studying! You can do better!';
  };

  const submitQuizAttempt = async () => {
    try {
      const response = await fetch(`${apiBase}/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || null,
        },
        body: JSON.stringify({
          title : quiz.title,
          description : "Quiz about " + quiz.title + " with " + quiz.questions.length + " questions in "  + quiz.difficulty + " difficulty in " + quiz.language + " language",
          language : quiz.language,
          questions : quiz.questions,
          difficulty : quiz.difficulty,
        })
      });
      
      if (!response.ok) throw new Error('Failed to save attempt');
      const data = await response.json();
      submitUserScore(data.id);
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
    }
  };

  const submitUserScore = async (quiz_id, isUpdate = false) => {
    let method = 'POST';
    let targetId = quiz_id; // default to quiz_id for POST endpoint

    if (isUpdate) {
      try {
        const res = await fetch(`${apiBase}/scores/${quiz_id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || ''
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.quiz_id === quiz.id && data.id) {
            method = 'PUT';
            targetId = data.id; // score_id for PUT endpoint
          }
        }
      } catch (e) {
        console.error('Failed to check existing score, will create a new score', e);
      }
    }

    try {
      const body = JSON.stringify({
        score: calculateScore(),
        max_score: quiz.questions.length,
        answers: selectedAnswers,
      });

      const url = method === 'POST'
        ? `${apiBase}/scores/${quiz_id}`
        : `${apiBase}/scores/${targetId}`; // score_id when updating

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}` || ''
        },
        body
      });

      if (!response.ok) throw new Error('Failed to save score');
    } catch (error) {
      console.error('Error submitting user score:', error);
    }
  };

  const generateQuizReport = async () => {
    setGenerateStatus('generating');
    try {
      await generateReportPDF(quiz, selectedAnswers);
      setGenerateStatus('success');
      setTimeout(() => setGenerateStatus(''), 3000);
    } catch (error) {
      setGenerateStatus('error');
      setTimeout(() => setGenerateStatus(''), 3000);
      console.error('Error generating PDF report:', error);
    }
  };

  const generateEmptyQuiz = async () => {
    setGenerateStatus('generating-empty');
    try {
      await generateWorksheetPDF(quiz);
      setGenerateStatus('success');
      setTimeout(() => setGenerateStatus(''), 3000);
    } catch (error) {
      setGenerateStatus('error');
      setTimeout(() => setGenerateStatus(''), 3000);
      console.error('Error generating empty quiz PDF:', error);
    }
  };

  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    if (quiz.difficulty === "redo") {
      submitUserScore(quiz.id, true);
      return;
    }

    // If this quiz originated from Browse (already exists in DB), just submit score
    if (quiz.id) {
      submitUserScore(quiz.id, false);
      return;
    }

    if (quiz.questions.length > 0) {
      submitQuizAttempt();
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(`${apiBase}/quizzes/stats/global`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setGlobalStats(data);
        }

        if (quiz && quiz.id) {
          const r2 = await fetch(`${apiBase}/quizzes/${quiz.id}/scores/count`);
          if (r2.ok) {
            const d2 = await r2.json();
            if (mounted) setAttemptsCount(d2.attempts ?? d2.count ?? 0);
          }
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      } finally {
        if (mounted) setStatsLoading(false);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, [quiz?.id]);

  if (showingReport) {
    return (
      <div className="w-full max-w-4xl glass-card p-8 rounded-2xl" role="region" aria-labelledby="detailed-report-heading">
        <div className="text-center mb-8">
          <h2 id="detailed-report-heading" className="text-3xl font-extrabold text-gray-900 mb-4">📊 Detailed Report</h2>
          <button
            onClick={() => setShowingReport(false)}
            className="btn-secondary mb-6 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Back to summary"
          >
            ← Back to Summary
          </button>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.answer;
            return (
              <div
                key={index}
                className={`p-6 rounded-xl border-l-4 ${
                  isCorrect 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-red-500 bg-red-50'
                }`}
                role="group"
                aria-labelledby={`question-${index}-title`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 id={`question-${index}-title`} className="text-lg font-semibold text-gray-900">
                    Question {index + 1}
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`} aria-hidden="true">
                    {isCorrect ? '✓' : '✗'}
                  </div>
                </div>
                
                <p className="text-gray-800 mb-4 font-medium">{question.question}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">Your answer:</span>
                    <span className={`font-semibold ${
                      isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {selectedAnswers[index] || 'No answer provided'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">Correct answer:</span>
                    <span className="font-semibold text-green-700">
                      {question.answer}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl glass-card p-8 rounded-2xl" role="region" aria-labelledby="recap-heading">
      {/* Status Messages */}
      {generateStatus && (
        <div role="status" aria-live="polite" aria-atomic="true" className={`p-4 rounded-lg mb-6 ${
          generateStatus.includes('success') ? 'bg-green-100 text-green-800' :
          generateStatus.includes('error') ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {generateStatus === 'generating' && '📄 Generating PDF report...'}
          {generateStatus === 'generating-empty' && '📝 Generating PDF worksheet...'}
          {generateStatus === 'success' && '✅ PDF downloaded successfully!'}
          {generateStatus === 'error' && '❌ Error generating PDF. Please try again.'}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 id="recap-heading" className="text-3xl font-extrabold text-gray-900 mb-2">Quiz Complete!</h2>
        <div className={`inline-flex items-center justify-center rounded-full p-6 mb-4 bg-white shadow-sm`}>
          <div className={`text-6xl font-extrabold ${getPerformanceColor()}`} aria-label={`Score percentage ${getScorePercentage()} percent`}>
            <span className="sr-only">Score percentage:</span>
            {getScorePercentage()}%
          </div>
        </div>
        <p className="text-xl text-gray-800 mb-2" aria-live="polite">{getPerformanceMessage()}</p>
        <p className="text-gray-800">
          You scored <span className="font-bold text-indigo-600">{calculateScore()}</span> out of <span className="font-bold">{quiz.questions.length}</span> questions
        </p>
      </div>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-green-700">{calculateScore()}</div>
          <div className="text-sm text-gray-700">Correct</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-red-700">{quiz.questions.length - calculateScore()}</div>
          <div className="text-sm text-gray-700">Incorrect</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-700">{quiz.questions.length}</div>
          <div className="text-sm text-gray-700">Total</div>
        </div>
      </div>

      {/* Global / Quiz attempts stats */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm text-gray-700">
          <div className="p-3 bg-gray-50 rounded-lg text-center w-36">
            <div className="text-lg font-bold text-indigo-600">{statsLoading ? '—' : (attemptsCount ?? '—')}</div>
            <div className="text-xs">This quiz attempts</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center w-36">
            <div className="text-lg font-bold text-indigo-600">{globalStats?.total_quizzes ?? '—'}</div>
            <div className="text-xs">Total quizzes</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center w-36">
            <div className="text-lg font-bold text-indigo-600">{globalStats?.total_attempts ?? '—'}</div>
            <div className="text-xs">Total attempts</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowingReport(true)}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="View detailed report"
          >
            <span aria-hidden="true">📊</span>
            <span className="text-sm text-black">View Detailed Report</span>
          </button>
          <button
            onClick={generateQuizReport}
            disabled={generateStatus === 'generating'}
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Download PDF report"
          >
            {generateStatus === 'generating' ? (
              <>
                <div className="loading-spinner" aria-hidden="true"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">📄</span>
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={generateEmptyQuiz}
            disabled={generateStatus === 'generating-empty'}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Print PDF worksheet"
          >
            {generateStatus === 'generating-empty' ? (
              <>
                <div className="loading-spinner" aria-hidden="true"></div>
                <span className="text-sm text-black">Generating...</span>
              </>
            ) : (
              <>
                <span aria-hidden="true">📝</span>
                <span className="text-sm text-black">Print PDF Worksheet</span>
              </>
            )}
          </button>
          <button
            onClick={onRestart}
            className="flex-1 btn-ghost flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Start over"
          >
            <span aria-hidden="true">🔄</span>
            <span className="text-sm text-black">Start Over</span>
          </button>
        </div>
      </div>

      {/* Quiz Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Difficulty:</span> {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </div>
          <div>
            <span className="font-medium">Language:</span> {quiz.language}
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-xs text-gray-600">
            Want to try more quizzes? <Link href="/browse" className="text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Browse all quizzes</Link>
          </p>
        </div>
      </div>
    </div>
  );
}