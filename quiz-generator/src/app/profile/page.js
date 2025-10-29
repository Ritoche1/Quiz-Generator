'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateReportPDF, generateWorksheetPDF } from '@/lib/pdf';
import ToggleSwitch from '@/components/ToggleSwitch';
import ConfirmModal from '@/components/ConfirmModal';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [remainingGenerations, setRemainingGenerations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();

  // Server-side pagination flags
  const [serverPaging, setServerPaging] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('quizToken');
    if (!token) {
      const ret = encodeURIComponent('/profile');
      router.push(`/?redirect=${ret}`);
      return;
    }
    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('auth'))
      .then(u => { setUser(u); fetchHistory(1); })
      .catch(() => { const ret = encodeURIComponent('/profile'); router.push(`/?redirect=${ret}`); })
      .finally(() => setLoading(false));
  }, [router]);

  // Fetch remaining generations for display
  const fetchRemainingGenerations = async () => {
    try {
      const res = await fetch(`${baseUrl}/generate/remaining`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRemainingGenerations(typeof data.remaining === 'number' ? data.remaining : null);
    } catch (e) { setRemainingGenerations(null); }
  };

  useEffect(() => { if (user) fetchRemainingGenerations(); }, [user]);

  const fetchHistory = async (pageNumber = 1) => {
    try {
      const offset = (pageNumber - 1) * pageSize;
      const url = `${baseUrl}/scores/user/history?offset=${offset}&limit=${pageSize}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } });

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && Array.isArray(data.items)) {
          // Server-paginated payload
          setServerPaging(true);
          setHistory(data.items || []);
          setTotalCount(typeof data.total === 'number' ? data.total : (data.items?.length || 0));
          setPage(pageNumber);
          return;
        }
        // Fallback to legacy list payload
        const arr = Array.isArray(data) ? data : [];
        setServerPaging(false);
        setHistory(arr);
        setTotalCount(arr.length);
        setPage(pageNumber);
      }
    } catch (e) { console.error('Failed to fetch history', e); }
  };

  // Fetch quizzes created by the current user for management (My Quizzes)
  const [myQuizzes, setMyQuizzes] = useState([]);
  const fetchMyQuizzes = async () => {
    try {
      const res = await fetch(`${baseUrl}/editor/my-quizzes`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } });
      if (!res.ok) throw new Error('Failed to fetch my quizzes');
      const data = await res.json();
      setMyQuizzes(data || []);
    } catch (e) { console.error('Failed to fetch my quizzes', e); setMyQuizzes([]); }
  };

  useEffect(() => { if (user) fetchMyQuizzes(); }, [user]);

  // Compute current streak based on history (consecutive days ending at latest attempt)
  const computeStreak = (historyArr) => {
    if (!historyArr || historyArr.length === 0) return 0;
    // unique day strings sorted descending
    const days = Array.from(new Set(historyArr.map(h => new Date(h.date).toISOString().slice(0,10)))).sort((a,b) => new Date(b) - new Date(a));
    let streak = 0;
    let expected = new Date(days[0]);
    for (const dayStr of days) {
      const d = new Date(dayStr);
      if (d.toDateString() === expected.toDateString()) {
        streak += 1;
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const accountStreak = useMemo(() => computeStreak(history), [history]);

  const totals = useMemo(() => {
    if (serverPaging) {
      // With server paging, we only know the total count reliably.
      // Best and average are approximated from current page to avoid heavy requests.
      const count = totalCount;
      if (!history?.length) return { count, best: 0, avgPct: 0 };
      let best = 0, sumPct = 0;
      history.forEach(h => {
        const pct = Math.round((h.score / h.max_score) * 100);
        sumPct += pct;
        if (pct > best) best = pct;
      });
      return { count, best, avgPct: Math.round(sumPct / history.length) };
    }

    if (!history?.length) return { count: 0, best: 0, avgPct: 0 };
    const count = history.length;
    let best = 0, sumPct = 0;
    history.forEach(h => {
      const pct = Math.round((h.score / h.max_score) * 100);
      sumPct += pct;
      if (pct > best) best = pct;
    });
    return { count, best, avgPct: Math.round(sumPct / count) };
  }, [history, serverPaging, totalCount]);

  const paged = useMemo(() => {
    if (serverPaging) return history; // already sliced by server
    const start = (page - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, page, serverPaging]);

  const totalPages = Math.max(1, Math.ceil((serverPaging ? totalCount : history.length) / pageSize));

  const redoQuiz = (quizId) => {
    router.push(`/?quiz=${quizId}`);
  };

  const deleteAttempt = async (scoreId) => {
    if (!confirm('Delete this attempt? This cannot be undone.')) return;
    setBusyId(scoreId);
    try {
      const res = await fetch(`${baseUrl}/scores/${scoreId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` }
      });
      if (res.ok) {
        if (serverPaging) {
          const newTotal = Math.max(0, totalCount - 1);
          const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize));
          const nextPage = Math.min(page, newTotalPages);
          setTotalCount(newTotal);
          await fetchHistory(nextPage);
        } else {
          setHistory(prev => {
            const next = prev.filter(h => h.score_id !== scoreId);
            const newTotalPages = Math.max(1, Math.ceil(next.length / pageSize));
            setPage(p => Math.min(p, newTotalPages));
            return next;
          });
        }
      }
    } catch (e) { console.error('Delete failed', e); }
    finally { setBusyId(null); }
  };

  const exportReport = async (score) => {
    setBusyId(score.score_id);
    try {
      const [attemptRes, quizRes] = await Promise.all([
        fetch(`${baseUrl}/scores/attempt/${score.score_id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } }),
        fetch(`${baseUrl}/quizzes/${score.quiz_id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } }),
      ]);
      if (!attemptRes.ok || !quizRes.ok) throw new Error('Failed to fetch data');
      const attempt = await attemptRes.json();
      const quiz = await quizRes.json();
      await generateReportPDF(quiz, attempt.answers);
    } catch (e) { console.error('Export report failed', e); }
    finally { setBusyId(null); }
  };

  const exportWorksheet = async (score) => {
    setBusyId(score.score_id);
    try {
      const res = await fetch(`${baseUrl}/quizzes/${score.quiz_id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` } });
      if (!res.ok) throw new Error('Failed to fetch quiz');
      const quiz = await res.json();
      await generateWorksheetPDF(quiz);
    } catch (e) { console.error('Export worksheet failed', e); }
    finally { setBusyId(null); }
  };

  const toggleQuizVisibility = async (quiz) => {
    setBusyId(quiz.id);
    try {
      const res = await fetch(`${baseUrl}/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('quizToken')}`
        },
        body: JSON.stringify({ is_public: !quiz.is_public })
      });
      if (!res.ok) throw new Error('Failed to update visibility');
      const updated = await res.json();
      setMyQuizzes(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (e) {
      console.error('Toggle visibility failed', e);
      alert('Failed to change quiz visibility');
    } finally {
      setBusyId(null);
    }
  };

  const requestDeleteQuiz = (quiz) => setDeleteTarget(quiz);

  const confirmDeleteQuiz = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${baseUrl}/quizzes/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` }
      });
      if (res.ok) {
        fetchMyQuizzes();
        fetchHistory();
      } else {
        throw new Error('Delete failed');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete quiz');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="loading-spinner mx-auto mb-3" />
          <p className="text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24 safe-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">👤 Profile</h1>
            <p className="text-white/80">Your stats and quiz management</p>
          </div>

          {/* Account Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-6 flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-800">{user?.username}</div>
                <div className="text-sm text-gray-600">{user?.email}</div>
                <div className="mt-2 text-sm text-gray-700">Streak: <span className="font-semibold text-indigo-600">{accountStreak} day{accountStreak !== 1 ? 's' : ''}</span></div>
              </div>
              <div className="text-sm text-gray-500">Member since<br/>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</div>
            </div>

            {/* Totals boxes remain next to account info on larger screens */}
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="card p-6 text-center">
                <div className="text-3xl font-extrabold text-indigo-600">{totals.count}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-extrabold text-green-600">{totals.best}%</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-3xl font-extrabold text-purple-600">{totals.avgPct}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>

          {/* Manage Section */}
          <div className="glass-card p-4 rounded-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Attempts</h2>
            {(!history || history.length === 0) ? (
              <div className="text-center py-12 text-gray-600">No attempts to manage.</div>
            ) : (
              <div className="space-y-3">
                {paged.map((h) => (
                  <div key={h.score_id} className="card p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 mb-1 truncate">{h.title}</h4>
                        <div className="text-xs text-gray-600 flex flex-wrap gap-3">
                          <span>🌐 {h.language}</span>
                          <span>⚡ {h.difficulty}</span>
                          <span>📅 {new Date(h.date).toLocaleString()}</span>
                          <span className="font-medium text-indigo-600">Score: {h.score}/{h.max_score}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => redoQuiz(h.quiz_id)} className="btn-ghost-light px-3 py-2 text-sm">Redo</button>
                        <button onClick={() => exportWorksheet(h)} disabled={busyId===h.score_id} className="btn-ghost-light px-3 py-2 text-sm">Worksheet PDF</button>
                        <button onClick={() => exportReport(h)} disabled={busyId===h.score_id} className="btn-primary px-3 py-2 text-sm">Report PDF</button>
                        <button onClick={() => deleteAttempt(h.score_id)} disabled={busyId===h.score_id} className="btn-ghost-light px-3 py-2 text-sm text-red-600 border-red-300 hover:border-red-400 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Pagination for Manage */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    disabled={page===1}
                    onClick={() => serverPaging ? fetchHistory(Math.max(1, page-1)) : setPage(p => Math.max(1, p-1))}
                    className="btn-ghost-light px-3 py-2 disabled:opacity-50"
                  >Prev</button>
                  <span className="text-gray-700 text-sm">Page {page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => serverPaging ? fetchHistory(page+1) : setPage(p => p+1)}
                    className="btn-ghost-light px-3 py-2 disabled:opacity-50"
                  >Next</button>
                </div>
              </div>
            )}
          </div>

          {/* My Quizzes Section */}
          <div className="glass-card p-6 rounded-2xl mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">My Quizzes</h2>
            {!myQuizzes || myQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't created any quizzes yet.</p>
                <button onClick={() => router.push('/editor')} className="btn-primary">
                  Create a Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myQuizzes.map((q) => (
                  <div key={q.id} className="card p-4 transition-shadow hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h4 className="font-semibold text-lg text-gray-800 mb-1 truncate">{q.title}</h4>
                        <div className="text-sm text-gray-500 flex items-center flex-wrap gap-x-4 gap-y-1">
                          <span><span className="font-medium">Language:</span> {q.language}</span>
                          <span><span className="font-medium">Difficulty:</span> {q.difficulty}</span>
                          <span><span className="font-medium">Questions:</span> {q.questions.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <ToggleSwitch 
                            isEnabled={q.is_public}
                            onToggle={() => toggleQuizVisibility(q)}
                            disabled={busyId === q.id}
                          />
                          <span className={`text-xs mt-1 font-medium ${q.is_public ? 'text-green-600' : 'text-gray-500'}`}>
                            {q.is_public ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <button onClick={() => router.push(`/editor?load=${q.id}`)} className="btn-ghost-light px-3 py-2 text-sm">Edit</button>
                        <button onClick={() => requestDeleteQuiz(q)} className="btn-ghost-light px-4 py-2 text-sm text-red-600 border-red-300 hover:border-red-400 hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this quiz?"
        message="This will permanently delete the quiz and its scores. This action cannot be undone."
        confirmText="Yes, delete"
        onConfirm={confirmDeleteQuiz}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </>
  );
}
