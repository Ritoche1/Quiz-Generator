'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('quizToken');
    if (token) {
        fetch(`${baseUrl}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Not authenticated');
            }
            return response.json();
        })
        .then(data => {
            setUser(data);
            setIsAuthenticated(true);
            // If redirected here after login, go back to target using client navigation
            const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const redirectTo = params?.get('redirect');
            if (redirectTo) {
              router.replace(redirectTo);
            }
        })
        .catch(error => {
            // Clear invalid token
            localStorage.removeItem('quizToken');
            setUser(null);
            setIsAuthenticated(false);
        });
    } else {
        setUser(null);
        setIsAuthenticated(false);
    }
    setLoading(false);
  }, [router]);

  // Load user stats and recent quizzes if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadUserData = async () => {
      const token = localStorage.getItem('quizToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      try {
        // Fetch recent quiz history
        const historyRes = await fetch(`${baseUrl}/scores/user/history?limit=5`, { headers });
        if (historyRes.ok) {
          const history = await historyRes.json();
          setRecentQuizzes(history);
        }

        // Calculate basic stats from history
        if (recentQuizzes.length > 0) {
          const totalQuizzes = recentQuizzes.length;
          const totalScore = recentQuizzes.reduce((acc, quiz) => acc + quiz.score, 0);
          const maxPossibleScore = recentQuizzes.reduce((acc, quiz) => acc + quiz.max_score, 0);
          const avgScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
          
          setStats({
            totalQuizzes: totalQuizzes >= 5 ? '5+' : totalQuizzes,
            averageScore: `${avgScore}%`,
            dailyStreak: JSON.parse(localStorage.getItem('dailyStreak') || '{"count":0}').count || 0
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, [isAuthenticated, recentQuizzes.length]);

  const handleLogin = () => {
      setIsAuthenticated(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-default flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen gradient-bg bg-default">
      <div className="main-container">
        {isAuthenticated ? (
          // Authenticated Home - Dashboard View
          <div className="w-full max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12 page-header">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-white/80 text-lg mb-8">
                Ready to challenge your mind with some fresh quizzes?
              </p>
              <Link 
                href="/generator" 
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
              >
                <span className="text-2xl">🧠</span>
                Create New Quiz
              </Link>
            </div>

            {/* Stats Section */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-card p-6 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</div>
                  <div className="text-sm text-gray-600">Quizzes Taken</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-gray-800">{stats.averageScore}</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-2xl font-bold text-gray-800">{stats.dailyStreak}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentQuizzes.length > 0 && (
              <div className="glass-card p-6 rounded-2xl mb-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                  <span>📚</span>
                  Recent Quizzes
                </h2>
                <div className="space-y-4">
                  {recentQuizzes.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{quiz.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <span>{quiz.difficulty === 'easy' ? '🟢' : quiz.difficulty === 'medium' ? '🟡' : '🔴'}</span>
                            {quiz.difficulty}
                          </span>
                          <span className="flex items-center gap-1">🌐 {quiz.language}</span>
                          <span className="flex items-center gap-1">📅 {new Date(quiz.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-indigo-600">{quiz.score}/{quiz.max_score}</div>
                        <div className="text-sm text-gray-500">
                          {Math.round((quiz.score / quiz.max_score) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span>🎯</span>
                  Explore Quizzes
                </h3>
                <p className="text-gray-600 mb-4">Browse quizzes created by the community</p>
                <Link href="/browse" className="btn-secondary inline-flex items-center gap-2">
                  <span>🌟</span>
                  Browse Quizzes
                </Link>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <span>🏆</span>
                  Compete
                </h3>
                <p className="text-gray-600 mb-4">See how you rank against other players</p>
                <Link href="/leaderboard" className="btn-secondary inline-flex items-center gap-2">
                  <span>📈</span>
                  View Leaderboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Guest Home - Landing Page
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Hero Section */}
            <div className="mb-16 page-header">
              <div className="text-6xl mb-6">🧠</div>
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                Quiz Generator
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                Generate personalized quizzes on any topic using AI. Challenge yourself, learn something new, and track your progress.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <AuthForm onLogin={handleLogin} />
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="glass-card p-8 rounded-2xl">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Smart Generation</h3>
                <p className="text-gray-600">
                  AI-powered quiz creation on any topic, difficulty level, and language. Get personalized questions that match your learning goals.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your learning journey with detailed statistics, streaks, and performance analytics across all your quizzes.
                </p>
              </div>
              <div className="glass-card p-8 rounded-2xl">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Social Learning</h3>
                <p className="text-gray-600">
                  Connect with friends, share quizzes, compete on leaderboards, and make learning a collaborative experience.
                </p>
              </div>
            </div>

            {/* Quick Preview */}
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Explore Without Signing Up
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/browse" className="btn-secondary inline-flex items-center gap-2">
                  <span>🎯</span>
                  Browse Public Quizzes
                </Link>
                <Link href="/leaderboard" className="btn-secondary inline-flex items-center gap-2">
                  <span>🏆</span>
                  View Leaderboard
                </Link>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <p className="text-white/80 mb-4">
                Join thousands of learners already using Quiz Generator
              </p>
              <div className="text-sm text-white/60">
                Free to use • No spam • Secure & Private
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
