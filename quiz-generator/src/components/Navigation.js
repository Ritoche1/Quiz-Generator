// File: quiz-generator/src/components/Navigation.js
'use client';
import { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

function NavigationImpl({ user, onRedoQuiz, onNewQuiz }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [quizHistory, setQuizHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [unread, setUnread] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const router = useRouter();
    const notifRef = useRef(null);

    useEffect(() => {
        if (user) {
            setLoadingHistory(true);
            fetchHistory();
            refreshUnread();
            const id = setInterval(refreshUnread, 15000);
            return () => clearInterval(id);
        } else {
            setQuizHistory([]);
            setLoadingHistory(false);
            setUnread(0);
            setNotifs([]);
        }
    }, [user]);

    // click-outside for notifications dropdown
    useEffect(() => {
        function onDocClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
        }
        if (showNotifs) document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showNotifs]);

    // Prevent body scroll when menu is open on mobile
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` });

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${baseUrl}/scores/user/history`, { headers: authHeader() });
            const data = await response.json();
            setQuizHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const refreshUnread = async () => {
        try {
            const res = await fetch(`${baseUrl}/notifications/unread`, { headers: authHeader() });
            if (!res.ok) return;
            const data = await res.json();
            setUnread(data.unread || 0);
        } catch (e) {
            console.error('Unread fetch failed:', e);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${baseUrl}/notifications?limit=10`, { headers: authHeader() });
            if (!res.ok) return;
            const data = await res.json();
            setNotifs(data);
        } catch (e) {
            console.error('List notifications failed:', e);
        }
    };

    const openNotifications = async () => {
        if (!showNotifs) {
            await fetchNotifications();
        }
        setShowNotifs((s) => !s);
    };

    const markAllRead = async () => {
        try {
            await fetch(`${baseUrl}/notifications/read-all`, { method: 'POST', headers: authHeader() });
            setUnread(0);
        } catch (e) {
            console.error('Mark all read failed:', e);
        }
    };

    const handleDelete = async (scoreId) => {
        try {
            await fetch(`${baseUrl}/scores/${scoreId}`, {
                method: 'DELETE',
                headers: authHeader()
            });
            setQuizHistory(prev => prev.filter(item => item.score_id !== scoreId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleRedo = async (quizId) => {
        setIsMenuOpen(false);
        try {
            const response = await fetch(`${baseUrl}/quizzes/${quizId}`, { headers: authHeader() });
            const quizData = await response.json();
            onRedoQuiz?.(quizData);
        } catch (error) {
            console.error('Redo failed:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('quizToken');
        router.replace('/');
    };

    return (
        <nav className="w-full nav-glass fixed top-0 z-50 pt-[env(safe-area-inset-top)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left cluster: burger always visible; other actions only if authenticated */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {
                                if (!isMenuOpen && user) fetchHistory();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="btn-ghost p-2 rounded-lg"
                            aria-label="Open menu"
                            aria-expanded={isMenuOpen}
                            aria-controls="history-drawer"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {user && (
                            <>
                                <button
                                    onClick={() => { if (typeof onNewQuiz === 'function') { onNewQuiz(); } else { router.push('/'); } }}
                                    className="btn-secondary flex items-center gap-2 px-3 py-2"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="hidden xs:inline">New Quiz</span>
                                </button>

                                <div className="hidden md:flex items-center space-x-1">
                                    <Link href="/browse" className="btn-ghost text-sm px-3 py-2">🎯 Browse</Link>
                                    <Link href="/leaderboard" className="btn-ghost text-sm px-3 py-2">🏆 Leaderboard</Link>
                                    <Link href="/editor" className="btn-ghost text-sm px-3 py-2">📝 Editor</Link>
                                    <Link href="/profile" className="btn-ghost text-sm px-3 py-2">👤 Profile</Link>
                                    <Link href="/friends" className="btn-ghost text-sm px-3 py-2">🤝 Friends</Link>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex-1 flex justify-center">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">Q</span>
                            </div>
                            <span className="text-white font-bold text-xl hidden sm:block">Quiz Generator</span>
                        </Link>
                    </div>

                    {user ? (
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Notification bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={openNotifications}
                                    className="btn-ghost p-2 rounded-lg relative"
                                    aria-haspopup="menu"
                                    aria-expanded={showNotifs}
                                    aria-label="Notifications"
                                >
                                    <span className="sr-only">Notifications</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    {unread > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full">{unread > 9 ? '9+' : unread}</span>
                                    )}
                                </button>
                                {showNotifs && (
                                    <div role="menu" className="absolute right-0 mt-2 w-80 max-w-[90vw] glass-card shadow-lg z-50">
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                                            <span className="font-semibold text-gray-800">Notifications</span>
                                            {unread > 0 && (
                                                <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                                            )}
                                        </div>
                                        <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                                            {notifs.length === 0 ? (
                                                <li className="p-4 text-sm text-gray-600">No notifications</li>
                                            ) : notifs.map((n) => (
                                                <li key={n.id} className="p-3 text-sm">
                                                    {n.type === 'friend_request' && (
                                                        <div>🤝 New friend request from <strong>{n.data?.from_username || 'someone'}</strong></div>
                                                    )}
                                                    {n.type === 'friend_accepted' || n.type === 'friend_accept' ? (
                                                        <div>✅ <strong>{n.data?.by_username || 'A friend'}</strong> accepted your request</div>
                                                    ) : null}
                                                    {n.type === 'friend_declined' || n.type === 'friend_decline' ? (
                                                        <div>❌ <strong>{n.data?.by_username || 'A friend'}</strong> declined your request</div>
                                                    ) : null}
                                                    {!['friend_request','friend_accepted','friend_accept','friend_declined','friend_decline'].includes(n.type) && (
                                                        <div>{n.type}</div>
                                                    )}
                                                    <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-white">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                                </div>
                                <span className="hidden sm:block font-medium">{user?.username || 'User'}</span>
                            </div>
                            
                            <button
                                onClick={handleLogout}
                                className="btn-ghost text-red-300 hover:text-red-200 hover:bg-red-500/20 p-2 rounded-lg"
                                aria-label="Log out"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex justify-end space-x-2 sm:space-x-4">
                            <div className="hidden md:flex items-center space-x-1 mr-2 sm:mr-4">
                                <Link href="/browse" className="btn-ghost text-sm px-3 py-2">🎯 Browse Quizzes</Link>
                                <Link href="/leaderboard" className="btn-ghost text-sm px-3 py-2">🏆 Leaderboard</Link>
                            </div>
                            <Link href="/" className="btn-secondary">Login</Link>
                        </div>
                    )}
                </div>
            </div>

            {isMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div id="history-drawer" className="fixed md:absolute left-0 top-0 md:top-16 h-full md:h-auto w-full md:w-80 glass-card md:m-4 overflow-hidden z-50 flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span>{user ? '📊' : '📂'}</span>
                                {user ? 'Quiz History' : 'Menu'}
                            </h3>
                            <button
                              className="btn-ghost p-2 rounded-lg text-gray-700"
                              aria-label="Close menu"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              ✕
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto md:max-h-96 p-4 sm:p-6 flex-1">
                            {/* Authenticated: show history; else show CTA */}
                            {user ? (
                                loadingHistory ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="loading-spinner"></div>
                                        <span className="ml-2 text-gray-600">Loading...</span>
                                    </div>
                                ) : quizHistory.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">🎯</div>
                                        <p className="text-gray-600">No quizzes taken yet</p>
                                        <p className="text-sm text-gray-500">Start by creating your first quiz!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {quizHistory.map((quiz, index) => (
                                            <div key={index} className="card p-4 group">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-800 mb-1 truncate">{quiz.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                                            <span className="flex items-center gap-1"><span>{quiz.difficulty === 'easy' ? '🟢' : quiz.difficulty === 'medium' ? '🟡' : '🔴'}</span>{quiz.difficulty}</span>
                                                            <span className="flex items-center gap-1">🌐 {quiz.language}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-indigo-600">Score: {quiz.score}/{quiz.max_score}</span>
                                                            <span className="text-xs text-gray-500">{new Date(quiz.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-1 sm:ml-4">
                                                        <button
                                                            onClick={() => handleRedo(quiz.quiz_id)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                                            title="Redo quiz"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(quiz.score_id)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Delete record"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-gray-700">You are not logged in.</p>
                                    <Link href="/" className="btn-primary inline-flex items-center justify-center px-4 py-2 rounded-lg">Login</Link>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 border-t border-gray-200 md:hidden">
                            <h4 className="font-medium text-gray-800 mb-3">Quick Links</h4>
                            <div className="space-y-2">
                                <Link href="/browse" className="block p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>🎯 Browse Quizzes</Link>
                                <Link href="/leaderboard" className="block p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>🏆 Leaderboard</Link>
                                <Link href="/editor" className="block p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>📝 Quiz Editor</Link>
                                <Link href="/profile" className="block p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>👤 Profile</Link>
                                <Link href="/friends" className="block p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setIsMenuOpen(false)}>🤝 Friends</Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}

export default memo(NavigationImpl);