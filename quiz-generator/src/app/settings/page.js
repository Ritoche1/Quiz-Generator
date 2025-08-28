'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('quizToken');
    if (!token) {
      router.push('/');
      return;
    }

    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('auth'))
      .then(u => setUser(u))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));

    // Load audio preference
    const saved = localStorage.getItem('quizAudioMuted');
    if (saved !== null) {
      setAudioMuted(JSON.parse(saved));
    }
  }, [router]);

  const handleAudioToggle = () => {
    const newMuted = !audioMuted;
    setAudioMuted(newMuted);
    localStorage.setItem('quizAudioMuted', JSON.stringify(newMuted));
  };

  if (loading) {
    return <div className="min-h-screen bg-default flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg bg-default">
      <div className="main-container">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="mb-4 btn-ghost-light px-4 py-2 text-sm flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/80">Manage your account and preferences</p>
          </div>

          <div className="grid gap-6">
            {/* User Management Section */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Username</h3>
                    <p className="text-sm text-gray-600">{user.username}</p>
                  </div>
                  <button className="btn-ghost-light px-4 py-2 text-sm">Edit</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <button className="btn-ghost-light px-4 py-2 text-sm">Edit</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Password</h3>
                    <p className="text-sm text-gray-600">••••••••</p>
                  </div>
                  <button className="btn-ghost-light px-4 py-2 text-sm">Change</button>
                </div>
              </div>
            </div>

            {/* Audio Settings Section */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Audio Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Background Music</h3>
                    <p className="text-sm text-gray-600">Play ambient music while using the app</p>
                  </div>
                  <button 
                    onClick={handleAudioToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${audioMuted ? 'bg-gray-300' : 'bg-blue-600'}`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${audioMuted ? 'translate-x-1' : 'translate-x-6'}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Sound Effects</h3>
                    <p className="text-sm text-gray-600">Play sounds for correct/incorrect answers</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Subscription Section */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Subscription Plan</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-800">Free Plan</h3>
                      <p className="text-sm text-blue-600">5 quiz generations per day</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-800">$0</span>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-blue-600">Current Plan</span>
                    <button 
                      onClick={() => router.push('/settings/pricing')}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Settings Section */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Other Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Animations</h3>
                    <p className="text-sm text-gray-600">Enable background animations and transitions</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications about friend requests and achievements</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Data Export</h3>
                    <p className="text-sm text-gray-600">Export your quiz history and statistics</p>
                  </div>
                  <button className="btn-ghost-light px-4 py-2 text-sm">Export</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}