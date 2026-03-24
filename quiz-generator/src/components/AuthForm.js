'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let url = '/auth/register';
    let body = JSON.stringify({ username, email, password });
    let headers = { 'Content-Type': 'application/json' };

    if (isLogin) {
      url = '/auth/login';
      body = new URLSearchParams({ username: email, password });
      headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    }

    try {
      const response = await fetch(baseUrl + url, { method: 'POST', headers, body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || 'Something went wrong');

      if (isLogin) {
        localStorage.setItem('quizToken', data.access_token);
        try { onLogin?.(); } catch {}
        try { window.dispatchEvent(new CustomEvent('auth-login')); } catch {}
      } else {
        // Auto-login after register
        localStorage.setItem('quizToken', data.access_token);
        try { onLogin?.(); } catch {}
        try { window.dispatchEvent(new CustomEvent('auth-login')); } catch {}
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (password.length < 10) return { label: 'Medium', color: 'bg-amber-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = !isLogin ? getPasswordStrength() : null;

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
              isLogin ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
              !isLogin ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                placeholder="Choose a username"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
              placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
              required
            />
            {strength && !isLogin && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={() => router.push('/reset-password')}
              className="w-full text-sm text-indigo-600 hover:underline"
            >
              Forgot your password?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
