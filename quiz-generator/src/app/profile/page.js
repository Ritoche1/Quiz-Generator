'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { generateWorksheetPDF } from '@/lib/pdf';
import { getErrorMessage } from '@/lib/api';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

function ScoreBar({ score, max }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-500';
  const textColor = pct >= 80 ? 'text-emerald-700' : pct >= 50 ? 'text-amber-700' : 'text-red-600';
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-bold tabular-nums ${textColor}`}>{pct}%</span>
    </div>
  );
}

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

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Account settings
  const [editUsername, setEditUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openQuizMenuId, setOpenQuizMenuId] = useState(null);
  const quizMenuRef = useRef(null);

  const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` });

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${baseUrl}/auth/me/avatar`, { method: 'POST', headers: authHeader(), body: form });
      if (res.ok) { setUser(await res.json()); toast('Profile picture updated', 'success'); }
      else { toast(await getErrorMessage(res, 'Upload failed.'), 'error'); }
    } catch { toast('Upload failed.', 'error'); }
    finally { setUploadingAvatar(false); e.target.value = ''; }
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${baseUrl}/auth/me/cover`, { method: 'POST', headers: authHeader(), body: form });
      if (res.ok) { setUser(await res.json()); toast('Cover image updated', 'success'); }
      else { toast(await getErrorMessage(res, 'Upload failed.'), 'error'); }
    } catch { toast('Upload failed.', 'error'); }
    finally { setUploadingCover(false); e.target.value = ''; }
  };

  useEffect(() => {
    const token = localStorage.getItem('quizToken');
    if (!token) { router.push(`/?redirect=${encodeURIComponent('/profile')}`); return; }
    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => { setUser(u); setEditUsername(u.username); fetchHistory(1); fetchMyQuizzes(); fetchStats(); })
      .catch(() => router.push(`/?redirect=${encodeURIComponent('/profile')}`))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (openQuizMenuId && quizMenuRef.current && !quizMenuRef.current.contains(event.target)) {
        setOpenQuizMenuId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenQuizMenuId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [openQuizMenuId]);

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
        body: JSON.stringify({ is_public: !quiz.is_public }),
      });
      if (res.ok) { const updated = await res.json(); setMyQuizzes(prev => prev.map(p => p.id === updated.id ? updated : p)); }
    } catch { toast('Failed to change visibility', 'error'); }
    finally { setBusyId(null); }
  };

  const duplicateQuiz = async (quiz) => {
    setBusyId(quiz.id);
    try {
      const res = await fetch(`${baseUrl}/editor/quiz/${quiz.id}/duplicate`, {
        method: 'POST',
        headers: authHeader(),
      });
      if (res.ok) {
        toast('Quiz duplicated', 'success');
        fetchMyQuizzes();
      } else {
        toast('Failed to duplicate quiz', 'error');
      }
    } catch {
      toast('Failed to duplicate quiz', 'error');
    } finally {
      setBusyId(null);
      setOpenQuizMenuId(null);
    }
  };

  const exportWorksheet = async (quiz) => {
    setBusyId(quiz.id);
    try {
      await generateWorksheetPDF(quiz);
      toast('Worksheet PDF downloaded', 'success');
    } catch {
      toast('Failed to export worksheet PDF', 'error');
    } finally {
      setBusyId(null);
      setOpenQuizMenuId(null);
    }
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
        body: JSON.stringify({ username: editUsername.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated); toast('Username updated', 'success');
        window.dispatchEvent(new CustomEvent('auth-login'));
      } else { toast(await getErrorMessage(res, 'Failed to update username.'), 'error'); }
    } catch { toast('Failed to update username.', 'error'); }
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
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (res.ok) { toast('Password changed', 'success'); setCurrentPassword(''); setNewPassword(''); }
      else { toast(await getErrorMessage(res, 'Failed to change password.'), 'error'); }
    } catch { toast('Failed to change password.', 'error'); }
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
        <Skeleton className="h-44 w-full mb-6 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const statItems = [
    {
      label: 'Quizzes Taken',
      value: stats?.totalTaken ?? '—',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      ),
      bg: 'bg-indigo-50', iconColor: 'text-indigo-600', valueColor: 'text-indigo-700',
    },
    {
      label: 'Average Score',
      value: stats ? `${stats.avgScore}%` : '—',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      bg: 'bg-violet-50', iconColor: 'text-violet-600', valueColor: 'text-violet-700',
    },
    {
      label: 'Best Score',
      value: stats ? `${stats.bestScore}%` : '—',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
        </svg>
      ),
      bg: 'bg-amber-50', iconColor: 'text-amber-600', valueColor: 'text-amber-700',
    },
    {
      label: 'Day Streak',
      value: stats?.streak ?? '—',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
        </svg>
      ),
      bg: 'bg-rose-50', iconColor: 'text-rose-600', valueColor: 'text-rose-700',
    },
  ];

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Profile header ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

          {/* Cover image */}
          <label className="relative block h-32 cursor-pointer group" title="Change cover image">
            {user?.cover_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`${baseUrl}${user.cover_url}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                <div className="absolute inset-0 dot-grid" aria-hidden="true" />
              </div>
            )}
            {/* Edit overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
              {uploadingCover ? (
                <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                  Change cover
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleUploadCover}
              disabled={uploadingCover}
            />
          </label>

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">

              {/* Avatar with upload overlay */}
              <label className="relative cursor-pointer group shrink-0 w-fit" title="Change profile picture">
                <div className="ring-4 ring-white rounded-full">
                  <Avatar
                    username={user?.username}
                    size="xl"
                    imageUrl={user?.avatar_url ? `${baseUrl}${user.avatar_url}` : null}
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                  {uploadingAvatar ? (
                    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleUploadAvatar}
                  disabled={uploadingAvatar}
                />
              </label>

              <div className="sm:flex-1 sm:pb-1">
                <h1 className="font-display text-3xl font-extrabold text-gray-900 leading-tight">
                  <span className="inline-block bg-white/90 px-2 py-0.5 rounded-md shadow-sm">{user?.username}</span>
                </h1>
                <p className="text-sm mt-1">
                  <span className="inline-block bg-white/90 text-gray-700 px-2 py-0.5 rounded-md">{user?.email}</span>
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Member since {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                    : 'recently'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {statItems.map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <div className={`w-10 h-10 ${kpi.bg} ${kpi.iconColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                {kpi.icon}
              </div>
              <div className={`text-2xl font-bold font-display tabular-nums ${kpi.valueColor}`}>{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-1 leading-tight">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Card className="overflow-hidden">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-6">

            {/* Quiz History */}
            {activeTab === 'history' && (
              history.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  }
                  title="No quiz history yet"
                  description="Start taking quizzes to track your progress here."
                  action={
                    <button
                      onClick={() => router.push('/')}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-sm transition-all"
                    >
                      Take a Quiz
                    </button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {history.map(h => (
                    <div
                      key={h.score_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{h.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <Badge variant={h.difficulty}>{h.difficulty}</Badge>
                          <span className="text-xs text-gray-400">{h.language}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <ScoreBar score={h.score} max={h.max_score} />
                        <span className="text-xs text-gray-400 tabular-nums hidden sm:block">{h.score}/{h.max_score}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => router.push(`/?quiz=${h.quiz_id}`)}
                            className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors"
                            title="Retake quiz"
                            aria-label="Retake quiz"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteAttempt(h.score_id)}
                            disabled={busyId === h.score_id}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                            title="Delete attempt"
                            aria-label="Delete attempt"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Pagination page={page} totalPages={totalPages} onPageChange={p => serverPaging ? fetchHistory(p) : setPage(p)} />
                </div>
              )
            )}

            {/* My Quizzes */}
            {activeTab === 'created' && (
              myQuizzes.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  }
                  title="No quizzes created yet"
                  description="Create your first quiz with the editor."
                  action={
                    <button
                      onClick={() => router.push('/editor')}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-sm transition-all"
                    >
                      Create Quiz
                    </button>
                  }
                />
              ) : (
                <div className="space-y-2" ref={quizMenuRef}>
                  <button
                    onClick={() => router.push('/editor')}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-gray-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create New Quiz
                  </button>

                  {myQuizzes.map(q => (
                    <div
                      key={q.id}
                      className="flex flex-col gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate text-sm">{q.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                            <span className="text-xs text-gray-400">{q.language}</span>
                            <span className="text-xs text-gray-400">{(q.questions || []).length} questions</span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <div className="flex flex-col items-center gap-0.5">
                              <ToggleSwitch isEnabled={q.is_public} onToggle={() => toggleQuizVisibility(q)} disabled={busyId === q.id} />
                              <span className={`text-[10px] font-medium ${q.is_public ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {q.is_public ? 'Public' : 'Private'}
                              </span>
                            </div>

                            <button
                              onClick={() => router.push(`/?quiz=${q.id}`)}
                              className="px-3 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all"
                            >
                              Start Quiz
                            </button>

                            <button
                              onClick={() => router.push(`/editor?load=${q.id}`)}
                              className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>

                        <div className="relative self-start">
                          <button
                            onClick={() => setOpenQuizMenuId(openQuizMenuId === q.id ? null : q.id)}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-label="Open quiz actions menu"
                            title="Actions"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75h.008v.008H12V6.75Zm0 5.25h.008v.008H12V12Zm0 5.25h.008v.008H12v-.008Z" />
                            </svg>
                          </button>

                          {openQuizMenuId === q.id && (
                            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden z-20">
                              <button
                                onClick={() => {
                                  setOpenQuizMenuId(null);
                                  router.push(`/?quiz=${q.id}`);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Start Quiz
                              </button>
                              <button
                                onClick={() => {
                                  setOpenQuizMenuId(null);
                                  router.push(`/editor?load=${q.id}`);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Edit Quiz
                              </button>
                              <button
                                onClick={() => duplicateQuiz(q)}
                                disabled={busyId === q.id}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                Duplicate Quiz
                              </button>
                              <button
                                onClick={() => exportWorksheet(q)}
                                disabled={busyId === q.id}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                Export Worksheet PDF
                              </button>
                              <button
                                onClick={() => {
                                  setOpenQuizMenuId(null);
                                  setDeleteTarget(q);
                                }}
                                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Delete Quiz
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Account Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-md">

                {/* Change username */}
                <div>
                  <h3 className="font-display font-semibold text-gray-900 mb-4">Change Username</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                        New username
                      </label>
                      <input
                        id="edit-username"
                        type="text"
                        value={editUsername}
                        onChange={e => setEditUsername(e.target.value)}
                        autoComplete="username"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleUpdateUsername}
                      disabled={editingUsername || editUsername === user?.username}
                      className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {editingUsername ? 'Saving…' : 'Save Username'}
                    </button>
                  </div>
                </div>

                {/* Change password */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-display font-semibold text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Current password
                      </label>
                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                        New password
                        <span className="text-gray-400 font-normal ml-1">(min. 6 characters)</span>
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {changingPassword ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="pt-6 border-t border-red-100">
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <h3 className="font-display font-semibold text-red-700 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-600 mb-4">
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 text-sm font-semibold border border-red-300 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Delete quiz modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Quiz?">
        <p className="text-gray-600 text-sm mb-5">
          <strong className="text-gray-900">&ldquo;{deleteTarget?.title}&rdquo;</strong> and all its scores will be permanently deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={deleteQuiz} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </Modal>

      {/* Delete account modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Your Account?">
        <p className="text-gray-600 text-sm mb-5">This action is permanent. All your quizzes, scores, and data will be deleted forever and cannot be recovered.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleDeleteAccount} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Delete My Account</button>
        </div>
      </Modal>
    </>
  );
}
