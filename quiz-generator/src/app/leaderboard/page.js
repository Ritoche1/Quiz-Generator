'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const PODIUM_COLORS = [
  { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', medal: '🥇', height: 'h-28' },
  { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600', medal: '🥈', height: 'h-20' },
  { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', medal: '🥉', height: 'h-16' },
];

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState({ easy: [], medium: [], hard: [] });
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchLeaderboard();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('quizToken');
    if (token) {
      try {
        const r = await fetch(`${baseUrl}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (r.ok) setUser(await r.json());
      } catch {}
    }
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    try {
      const [e, m, h] = await Promise.all(
        DIFFICULTIES.map(d => fetch(`${baseUrl}/quizzes/leaderboard/${d}`).then(r => r.json()))
      );
      setLeaderboardData({ easy: e, medium: m, hard: h });
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const r = await fetch(`${baseUrl}/quizzes/stats/global`);
      if (r.ok) setStats(await r.json());
    } catch {}
  };

  const currentData = leaderboardData[selectedDifficulty] || [];
  const top3 = currentData.slice(0, 3);
  const rest = currentData.slice(3);
  // Display order: 2nd, 1st, 3rd for podium
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mx-auto mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-500">Top quiz performers</p>
      </div>

      {/* Global stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { value: stats.totalQuizzes, label: 'Quizzes' },
            { value: stats.totalUsers, label: 'Users' },
            { value: `${stats.avgScore}%`, label: 'Avg Score' },
            { value: stats.topicOfTheWeek, label: 'Hot Topic' },
          ].map((s, i) => (
            <Card key={i} className="p-4 text-center">
              <div className="text-xl font-bold text-gray-900 truncate">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Difficulty tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedDifficulty === d
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="capitalize">{d}</span>
            </button>
          ))}
        </div>
      </div>

      {currentData.length === 0 ? (
        <EmptyState icon="🏆" title="No data yet" description="Take some quizzes to appear on the leaderboard!" />
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-10 px-4">
              {podiumOrder.map((player, idx) => {
                const actualRank = idx === 0 ? 1 : idx === 1 ? 0 : 2;
                const style = PODIUM_COLORS[actualRank];
                return (
                  <div key={idx} className="flex flex-col items-center" style={{ width: '120px' }}>
                    <Avatar username={player.username} size="lg" className="mb-2" />
                    <div className="text-sm font-semibold text-gray-900 truncate w-full text-center">{player.username}</div>
                    <div className="text-xs text-gray-500 mb-2">{player.score}%</div>
                    <div className={`w-full ${style.height} ${style.bg} border-2 ${style.border} rounded-t-xl flex items-center justify-center podium-animate`} style={{ animationDelay: `${idx * 0.2}s` }}>
                      <span className="text-2xl">{style.medal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Best</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quizzes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentData.map((player, i) => {
                    const isMe = user?.username === player.username;
                    return (
                      <tr key={i} className={isMe ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-gray-900">#{i + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar username={player.username} size="sm" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">{player.username}</span>
                              {isMe && <span className="ml-1.5 text-xs text-indigo-600 font-medium">(You)</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{player.score}%</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.avgScore}%</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{player.totalQuizzes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* CTA */}
      <div className="text-center mt-10">
        <Card className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to climb the ranks?</h3>
          <p className="text-gray-500 text-sm mb-4">Take more quizzes to improve your scores!</p>
          <Link href="/" className="inline-flex px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Start a Quiz
          </Link>
        </Card>
      </div>
    </div>
  );
}
