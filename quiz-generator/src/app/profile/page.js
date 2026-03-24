'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateReportPDF, generateWorksheetPDF } from '@/lib/pdf';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton, { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import ToggleSwitch from '@/components/ToggleSwitch';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [serverPaging, setServerPaging] = useState(false);
  const pageSize = 10;
  const router = useRouter();
  const toast = useToast();

  // Account settings
  const [editUsername, setEditUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` });

  useEffect(() => {
    const token = localStorage.getItem('quizToken');
    if (!token) { router.push(`/?redirect=${encodeURIComponent('/profile')}`); return; }
    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => { setUser(u); setEditUsername(u.username); fetchHistory(1); fetchMyQuizzes(); fetchStats(); })
      .catch(() => router.push(`/?redirect=${encodeURIComponent('/profile')}`))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${baseUrl}/users/stats`, { headers: authHeader() });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  const fetchHistory = async (pageNum = 1) => {
    try {
      const offset = (pageNum - 1) * pageSize;
      const res = await fetch(`${baseUrl}/scores/user/history?offset=${offset}&limit=${pageSize}`, { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && Array.isArray(data.items)) {
          setServerPaging(true); setHistory(data.items); setTotalCount(data.total || 0); setPage(pageNum);
        } else {
          setServerPaging(false); setHistory(Array.isArray(data) ? data : []); setTotalCount(data?.length || 0); setPage(pageNum);
        }
      }
    } catch {}
  };

  const fetchMyQuizzes = async () => {
    try {
      const res = await fetch(`${baseUrl}/editor/my-quizzes`, { headers: authHeader() });
      if (res.ok) setMyQuizzes(await res.json());
    } catch { setMyQuizzes([]); }
  };

  const totalPages = Math.max(1, Math.ceil((serverPaging ? totalCount : history.length) / pageSize));

  const deleteAttempt = async (scoreId) => {
    setBusyId(scoreId);
    try {
      const res = await fetch(`${baseUrl}/scores/${scoreId}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) { toast('Attempt deleted', 'success'); fetchHistory(page); fetchStats(); }
    } catch {} finally { setBusyId(null); }
  };

  const toggleQuizVisibility = async (quiz) => {
    setBusyId(quiz.id);
    try {
      const res = await fetch(`${baseUrl}/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ is_public: !quiz.is_public })
      });
      if (res.ok) { const updated = await res.json(); setMyQuizzes(prev => prev.map(p => p.id === updated.id ? updated : p)); }
    } catch { toast('Failed to change visibility', 'error'); }
    finally { setBusyId(null); }
  };

  const deleteQuiz = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${baseUrl}/quizzes/${deleteTarget.id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) { toast('Quiz deleted', 'success'); fetchMyQuizzes(); fetchHistory(1); }
    } catch { toast('Failed to delete quiz', 'error'); }
    finally { setDeleteTarget(null); }
  };

  const handleUpdateUsername = async () => {
    if (!editUsername.trim() || editUsername.trim().length < 2) { toast('Username must be at least 2 characters', 'error'); return; }
    setEditingUsername(true);
    try {
      const res = await fetch(`${baseUrl}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ username: editUsername.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated); toast('Username updated', 'success');
        window.dispatchEvent(new CustomEvent('auth-login'));
      } else { const d = await res.json(); toast(d.detail || 'Failed', 'error'); }
    } catch { toast('Failed to update username', 'error'); }
    finally { setEditingUsername(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast('Fill in both fields', 'error'); return; }
    if (newPassword.length < 6) { toast('New password must be at least 6 characters', 'error'); return; }
    setChangingPassword(true);
    try {
      const res = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      if (res.ok) { toast('Password changed', 'success'); setCurrentPassword(''); setNewPassword(''); }
      else { const d = await res.json(); toast(d.detail || 'Failed', 'error'); }
    } catch { toast('Failed to change password', 'error'); }
    finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${baseUrl}/auth/delete-account`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) {
        localStorage.removeItem('quizToken');
        window.dispatchEvent(new CustomEvent('auth-logout'));
        router.push('/');
      } else { toast('Failed to delete account', 'error'); }
    } catch { toast('Failed to delete account', 'error'); }
    finally { setShowDeleteModal(false); }
  };

  const tabs = [
    { id: 'history', label: 'Quiz History', count: serverPaging ? totalCount : history.length },
    { id: 'created', label: 'My Quizzes', count: myQuizzes.length },
    { id: 'settings', label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-24" count={4} />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar username={user?.username} size="xl" />
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-gray-400 text-xs mt-1">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Quizzes Taken', value: stats?.totalTaken ?? '-', icon: '📝', color: 'text-indigo-600' },
            { label: 'Average Score', value: stats ? `${stats.avgScore}%` : '-', icon: '📊', color: 'text-purple-600' },
            { label: 'Best Score', value: stats ? `${stats.bestScore}%` : '-', icon: '🏆', color: 'text-amber-600' },
            { label: 'Day Streak', value: stats?.streak ?? '-', icon: '🔥', color: 'text-red-500' },
          ].map((kpi, i) => (
            <Card key={i} className="p-5 text-center">
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Card className="overflow-hidden">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-6">
            {/* Quiz History */}
            {activeTab === 'history' && (
              <>
                {history.length === 0 ? (
                  <EmptyState icon="📝" title="No quiz history yet" description="Start taking quizzes to see your history here." action={
                    <button onClick={() => router.push('/')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                      Take a Quiz
                    </button>
                  } />
                ) : (
                  <div className="space-y-3">
                    {history.map(h => (
                      <div key={h.score_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{h.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                            <Badge variant={h.difficulty}>{h.difficulty}</Badge>
                            <span>{h.language}</span>
                            <span>{new Date(h.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-indigo-600">{h.score}/{h.max_score}</span>
                          <div className="flex gap-1">
                            <button onClick={() => router.push(`/?quiz=${h.quiz_id}`)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors" title="Redo">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                            <button onClick={() => deleteAttempt(h.score_id)} disabled={busyId === h.score_id} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Pagination page={page} totalPages={totalPages} onPageChange={p => serverPaging ? fetchHistory(p) : setPage(p)} />
                  </div>
                )}
              </>
            )}

            {/* My Quizzes */}
            {activeTab === 'created' && (
              <>
                {myQuizzes.length === 0 ? (
                  <EmptyState icon="✏️" title="No quizzes created" description="Create your first quiz with the editor." action={
                    <button onClick={() => router.push('/editor')} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                      Create Quiz
                    </button>
                  } />
                ) : (
                  <div className="space-y-3">
                    {/* Create new card */}
                    <button
                      onClick={() => router.push('/editor')}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      <span className="font-medium text-sm">Create New Quiz</span>
                    </button>
                    {myQuizzes.map(q => (
                      <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{q.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                            <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                            <span>{q.language}</span>
                            <span>{(q.questions || []).length} questions</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <ToggleSwitch isEnabled={q.is_public} onToggle={() => toggleQuizVisibility(q)} disabled={busyId === q.id} />
                            <span className={`text-xs mt-0.5 ${q.is_public ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {q.is_public ? 'Public' : 'Private'}
                            </span>
                          </div>
                          <button onClick={() => router.push(`/editor?load=${q.id}`)} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Edit</button>
                          <button onClick={() => setDeleteTarget(q)} className="px-3 py-1.5 text-xs font-medium border border-red-300 rounded-lg hover:bg-red-50 text-red-600">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Account Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-lg">
                {/* Change username */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Change Username</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    />
                    <button
                      onClick={handleUpdateUsername}
                      disabled={editingUsername || editUsername === user?.username}
                      className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {editingUsername ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Change password */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h3>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    />
                    <input
                      type="password"
                      placeholder="New password (min 6 chars)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    />
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>

                {/* Delete account */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-3">Permanently delete your account and all data. This cannot be undone.</p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete quiz modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Quiz?">
        <p className="text-gray-600 text-sm mb-4">This will permanently delete the quiz and all its scores.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={deleteQuiz} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>

      {/* Delete account modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Your Account?">
        <p className="text-gray-600 text-sm mb-4">This action is permanent. All your quizzes, scores, and data will be deleted forever.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDeleteAccount} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete My Account</button>
        </div>
      </Modal>
    </>
  );
}
