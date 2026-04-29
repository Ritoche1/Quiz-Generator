'use client';
import { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Avatar from './ui/Avatar';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

function NavigationImpl({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      refreshUnread();
      const id = setInterval(refreshUnread, 15000);
      return () => clearInterval(id);
    } else {
      setUnread(0);
      setNotifs([]);
    }
  }, [user]);

  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('quizToken')}` });

  const refreshUnread = async () => {
    try {
      const res = await fetch(`${baseUrl}/notifications/unread`, { headers: authHeader() });
      if (res.ok) { const data = await res.json(); setUnread(data.unread || 0); }
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${baseUrl}/notifications?limit=10`, { headers: authHeader() });
      if (res.ok) setNotifs(await res.json());
    } catch {}
  };

  const openNotifications = async () => {
    if (!showNotifs) await fetchNotifications();
    setShowNotifs(s => !s);
  };

  const markAllRead = async () => {
    try {
      await fetch(`${baseUrl}/notifications/read-all`, { method: 'POST', headers: authHeader() });
      setUnread(0);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('quizToken');
    window.dispatchEvent(new CustomEvent('auth-logout'));
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  const navLinks = user
    ? [
        { href: '/', label: 'Home' },
        { href: '/browse', label: 'Browse' },
        { href: '/leaderboard', label: 'Leaderboard' },
        { href: '/friends', label: 'Friends' },
      ]
    : [
        { href: '/browse', label: 'Browse' },
        { href: '/leaderboard', label: 'Leaderboard' },
      ];

  const renderNotifText = (n) => {
    if (n.type === 'friend_request') return <>New friend request from <strong>{n.data?.from_username || 'someone'}</strong></>;
    if (n.type === 'friend_accepted' || n.type === 'friend_accept') return <><strong>{n.data?.by_username || 'A friend'}</strong> accepted your request</>;
    if (n.type === 'friend_declined' || n.type === 'friend_decline') return <><strong>{n.data?.by_username || 'A friend'}</strong> declined your request</>;
    return n.type;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-gray-900 hidden sm:block">Quiz Generator</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={openNotifications}
                    className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full font-medium">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                        )}
                      </div>
                      <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                        {notifs.length === 0 ? (
                          <li className="p-4 text-sm text-gray-500 text-center">No notifications</li>
                        ) : notifs.map(n => (
                          <li key={n.id} className={`p-3 text-sm ${!n.is_read ? 'bg-indigo-50/50' : ''}`}>
                            <div className="text-gray-800">{renderNotifText(n)}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(s => !s)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Avatar username={user.username} size="sm" />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user.username}</span>
                    <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>My Profile</Link>
                      <Link href="/editor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>Quiz Editor</Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(s => !s)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-white border-l border-gray-200 z-50 md:hidden overflow-y-auto">
            <div className="p-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive(link.href)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <hr className="my-2 border-gray-100" />
                  <Link href="/profile" className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Profile</Link>
                  <Link href="/editor" className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Quiz Editor</Link>
                  <hr className="my-2 border-gray-100" />
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">Log out</button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default memo(NavigationImpl);
