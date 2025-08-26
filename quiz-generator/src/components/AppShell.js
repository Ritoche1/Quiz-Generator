'use client';
import { useEffect, useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function AppShell({ children }) {
  const [user, setUser] = useState(null);

  const fetchMe = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('quizToken') : null;
    if (!token) { setUser(null); return; }
    try {
      const r = await fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!r.ok) { setUser(null); return; }
      const u = await r.json();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    const onLogin = () => fetchMe();
    const onLogout = () => setUser(null);
    window.addEventListener('auth-login', onLogin);
    window.addEventListener('auth-logout', onLogout);
    return () => {
      window.removeEventListener('auth-login', onLogin);
      window.removeEventListener('auth-logout', onLogout);
    };
  }, []);

  return (
    <>
      <Navigation user={user} />
      {children}
      <Footer />
    </>
  );
}
