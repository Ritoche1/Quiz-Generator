'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Edit modals
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status messages
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('quizToken');
    if (!token) {
      router.push('/');
      return;
    }

    fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('auth'))
      .then(u => {
        setUser(u);
        setNewUsername(u.username);
        setNewEmail(u.email);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));

    // Load preferences
    const savedAudio = localStorage.getItem('quizAudioMuted');
    if (savedAudio !== null) {
      setAudioMuted(JSON.parse(savedAudio));
    }
    
    const savedEffects = localStorage.getItem('soundEffectsEnabled');
    if (savedEffects !== null) {
      setSoundEffectsEnabled(JSON.parse(savedEffects));
    }
    
    const savedAnimations = localStorage.getItem('animationsEnabled');
    if (savedAnimations !== null) {
      setAnimationsEnabled(JSON.parse(savedAnimations));
    }
    
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    if (savedNotifications !== null) {
      setNotificationsEnabled(JSON.parse(savedNotifications));
    }
  }, [router]);

  const authHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('quizToken')}`,
    'Content-Type': 'application/json'
  });

  const handleAudioToggle = () => {
    const newMuted = !audioMuted;
    setAudioMuted(newMuted);
    localStorage.setItem('quizAudioMuted', JSON.stringify(newMuted));
  };

  const handleSoundEffectsToggle = () => {
    const newEnabled = !soundEffectsEnabled;
    setSoundEffectsEnabled(newEnabled);
    localStorage.setItem('soundEffectsEnabled', JSON.stringify(newEnabled));
  };

  const handleAnimationsToggle = () => {
    const newEnabled = !animationsEnabled;
    setAnimationsEnabled(newEnabled);
    localStorage.setItem('animationsEnabled', JSON.stringify(newEnabled));
  };

  const handleNotificationsToggle = () => {
    const newEnabled = !notificationsEnabled;
    setNotificationsEnabled(newEnabled);
    localStorage.setItem('notificationsEnabled', JSON.stringify(newEnabled));
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setUpdateError('Username cannot be empty');
      return;
    }
    
    try {
      const response = await fetch(`${baseUrl}/auth/update-username`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ username: newUsername.trim() })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditingUsername(false);
        setUpdateMessage('Username updated successfully!');
        setUpdateError('');
      } else {
        const error = await response.json();
        setUpdateError(error.message || 'Failed to update username');
      }
    } catch (error) {
      setUpdateError('Network error occurred');
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      setUpdateError('Email cannot be empty');
      return;
    }
    
    try {
      const response = await fetch(`${baseUrl}/auth/update-email`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ email: newEmail.trim() })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditingEmail(false);
        setUpdateMessage('Email updated successfully!');
        setUpdateError('');
      } else {
        const error = await response.json();
        setUpdateError(error.message || 'Failed to update email');
      }
    } catch (error) {
      setUpdateError('Network error occurred');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setUpdateError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setUpdateError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setUpdateError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      const response = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      });
      
      if (response.ok) {
        setChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setUpdateMessage('Password changed successfully!');
        setUpdateError('');
      } else {
        const error = await response.json();
        setUpdateError(error.message || 'Failed to change password');
      }
    } catch (error) {
      setUpdateError('Network error occurred');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`${baseUrl}/auth/export-data`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz-generator-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setUpdateMessage('Data exported successfully!');
      } else {
        setUpdateError('Failed to export data');
      }
    } catch (error) {
      setUpdateError('Network error occurred');
    }
  };

  // Clear messages after a few seconds
  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => setUpdateMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  useEffect(() => {
    if (updateError) {
      const timer = setTimeout(() => setUpdateError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [updateError]);

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
          <div className="mb-8 page-header">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/80">Manage your account and preferences</p>
          </div>

          {/* Status Messages */}
          {updateMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
              {updateMessage}
            </div>
          )}
          {updateError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {updateError}
            </div>
          )}

          <div className="grid gap-6">
            {/* User Management Section */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Management</h2>
              <div className="space-y-4">
                {/* Username */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">Username</h3>
                    {editingUsername ? (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter new username"
                        />
                        <div className="mt-2 flex gap-2">
                          <button onClick={handleUpdateUsername} className="btn-primary px-3 py-1 text-sm">Save</button>
                          <button 
                            onClick={() => {
                              setEditingUsername(false);
                              setNewUsername(user.username);
                            }} 
                            className="btn-ghost-light px-3 py-1 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">{user.username}</p>
                    )}
                  </div>
                  {!editingUsername && (
                    <button 
                      onClick={() => setEditingUsername(true)} 
                      className="btn-ghost-light px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">Email</h3>
                    {editingEmail ? (
                      <div className="mt-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter new email"
                        />
                        <div className="mt-2 flex gap-2">
                          <button onClick={handleUpdateEmail} className="btn-primary px-3 py-1 text-sm">Save</button>
                          <button 
                            onClick={() => {
                              setEditingEmail(false);
                              setNewEmail(user.email);
                            }} 
                            className="btn-ghost-light px-3 py-1 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">{user.email}</p>
                    )}
                  </div>
                  {!editingEmail && (
                    <button 
                      onClick={() => setEditingEmail(true)} 
                      className="btn-ghost-light px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Password */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">Password</h3>
                    {changingPassword ? (
                      <div className="mt-2 space-y-2">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Current password"
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="New password"
                        />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Confirm new password"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleChangePassword} className="btn-primary px-3 py-1 text-sm">Change Password</button>
                          <button 
                            onClick={() => {
                              setChangingPassword(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            }} 
                            className="btn-ghost-light px-3 py-1 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">••••••••</p>
                    )}
                  </div>
                  {!changingPassword && (
                    <button 
                      onClick={() => setChangingPassword(true)} 
                      className="btn-ghost-light px-4 py-2 text-sm"
                    >
                      Change
                    </button>
                  )}
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
                  <button 
                    onClick={handleSoundEffectsToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!soundEffectsEnabled ? 'bg-gray-300' : 'bg-blue-600'}`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!soundEffectsEnabled ? 'translate-x-1' : 'translate-x-6'}`}
                    />
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
                  <button 
                    onClick={handleAnimationsToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!animationsEnabled ? 'bg-gray-300' : 'bg-blue-600'}`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!animationsEnabled ? 'translate-x-1' : 'translate-x-6'}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications about friend requests and achievements</p>
                  </div>
                  <button 
                    onClick={handleNotificationsToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!notificationsEnabled ? 'bg-gray-300' : 'bg-blue-600'}`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!notificationsEnabled ? 'translate-x-1' : 'translate-x-6'}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Data Export</h3>
                    <p className="text-sm text-gray-600">Export your quiz history and statistics</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    className="btn-ghost-light px-4 py-2 text-sm"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}