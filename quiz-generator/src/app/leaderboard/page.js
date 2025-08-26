'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState({
    easy: [],
    medium: [],
    hard: []
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchLeaderboard();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    const token = localStorage.getItem('quizToken');
    if (token) {
      try {
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    try {
      const [easyResponse, mediumResponse, hardResponse] = await Promise.all([
        fetch(`${baseUrl}/quizzes/leaderboard/easy`),
        fetch(`${baseUrl}/quizzes/leaderboard/medium`),
        fetch(`${baseUrl}/quizzes/leaderboard/hard`)
      ]);

      const [easyData, mediumData, hardData] = await Promise.all([
        easyResponse.json(),
        mediumResponse.json(), 
        hardResponse.json()
      ]);

      setLeaderboardData({
        easy: easyData,
        medium: mediumData,
        hard: hardData
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Fall back to mock data if API fails
      const mockData = {
        easy: [
          { username: 'QuizMaster', score: 95, totalQuizzes: 12, avgScore: 92 },
          { username: 'Brainiac', score: 88, totalQuizzes: 8, avgScore: 85 },
          { username: 'Scholar', score: 82, totalQuizzes: 15, avgScore: 78 },
          { username: 'Learner', score: 76, totalQuizzes: 6, avgScore: 72 },
          { username: 'Student', score: 70, totalQuizzes: 10, avgScore: 68 }
        ],
        medium: [
          { username: 'Expert', score: 91, totalQuizzes: 20, avgScore: 87 },
          { username: 'ProLearner', score: 85, totalQuizzes: 14, avgScore: 82 },
          { username: 'SmartCookie', score: 79, totalQuizzes: 11, avgScore: 76 },
          { username: 'WiseOwl', score: 73, totalQuizzes: 9, avgScore: 71 },
          { username: 'Thinker', score: 67, totalQuizzes: 7, avgScore: 64 }
        ],
        hard: [
          { username: 'Genius', score: 88, totalQuizzes: 25, avgScore: 84 },
          { username: 'MindBender', score: 82, totalQuizzes: 18, avgScore: 79 },
          { username: 'ChallengeSeeker', score: 76, totalQuizzes: 13, avgScore: 73 },
          { username: 'HardcoreQuiz', score: 70, totalQuizzes: 16, avgScore: 67 },
          { username: 'BrainStorm', score: 64, totalQuizzes: 8, avgScore: 61 }
        ]
      };
      setLeaderboardData(mockData);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${baseUrl}/quizzes/stats/global`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fall back to mock stats
      const mockStats = {
        totalQuizzes: 1247,
        totalUsers: 523,
        avgScore: 76,
        topicOfTheWeek: 'JavaScript Fundamentals'
      };
      setStats(mockStats);
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '🟢';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-default gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation user={user} />
      <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24 safe-bottom">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-3">
              <span>🏆</span>
              Leaderboard
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Compete with quiz masters from around the world
            </p>
          </div>

          {/* Global Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</div>
                <div className="text-gray-600 text-sm">Total Quizzes</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.totalUsers}</div>
                <div className="text-gray-600 text-sm">Active Users</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.avgScore}%</div>
                <div className="text-gray-600 text-sm">Average Score</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xl font-bold text-gray-800 truncate">{stats.topicOfTheWeek}</div>
                <div className="text-gray-600 text-sm">Hot Topic</div>
              </div>
            </div>
          )}

          {/* Difficulty Tabs */}
          <div className="flex justify-center mb-8">
            <div className="glass p-1 rounded-xl">
              <div className="flex space-x-1">
                {['easy', 'medium', 'hard'].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedDifficulty === difficulty
                        ? 'bg-white text-gray-800 shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{getDifficultyIcon(difficulty)}</span>
                    <span className="capitalize">{difficulty}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>{getDifficultyIcon(selectedDifficulty)}</span>
                <span className="capitalize">{selectedDifficulty} Mode Champions</span>
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Best Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quizzes Taken
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData[selectedDifficulty].map((player, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getRankIcon(index + 1)}</span>
                          <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-semibold text-sm">
                              {player.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{player.username}</div>
                            <div className="text-sm text-gray-500">
                              {user?.username === player.username && '(You!)'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-600">{player.score}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{player.avgScore}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{player.totalQuizzes}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Climb the Rankings?</h3>
              <p className="text-gray-600 mb-6">
                Take more quizzes and improve your scores to reach the top!
              </p>
              <Link
                href="/"
                className="btn-primary inline-flex items-center gap-2"
              >
                <span>🎯</span>
                <span>Start Quiz</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}