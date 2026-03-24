'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';
const languages = ['all', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Turkish', 'Polish'];

export default function BrowseQuizzes() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const router = useRouter();

  useEffect(() => { fetchQuizzes(); }, []);

  useEffect(() => { filterAndSort(); }, [quizzes, searchTerm, selectedDifficulty, selectedLanguage, sortBy]);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`${baseUrl}/quizzes/browse/public`);
      if (res.ok) setQuizzes(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const filterAndSort = () => {
    let filtered = [...quizzes];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(quiz => quiz.title?.toLowerCase().includes(q) || quiz.description?.toLowerCase().includes(q));
    }
    if (selectedDifficulty !== 'all') filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    if (selectedLanguage !== 'all') filtered = filtered.filter(quiz => quiz.language === selectedLanguage);
    filtered.sort((a, b) => {
      if (sortBy === 'popular') return (b.attempts || 0) - (a.attempts || 0);
      if (sortBy === 'score') return (b.avgScore || 0) - (a.avgScore || 0);
      return new Date(b.created || 0) - new Date(a.created || 0);
    });
    setFilteredQuizzes(filtered);
  };

  const handleStart = (quiz) => {
    const token = localStorage.getItem('quizToken');
    if (!token) { router.push(`/?redirect=${encodeURIComponent('/browse')}`); return; }
    router.push(`/?quiz=${quiz.id}`);
  };

  const clearFilters = () => { setSearchTerm(''); setSelectedDifficulty('all'); setSelectedLanguage('all'); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Quizzes</h1>
        <p className="text-gray-500">Discover quizzes created by the community</p>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Difficulty</label>
            <div className="flex gap-1.5">
              {['all', 'easy', 'medium', 'hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    selectedDifficulty === d ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Language</label>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
            >
              {languages.map(l => <option key={l} value={l}>{l === 'all' ? 'All Languages' : l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sort</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
            >
              <option value="created">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">{filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} found</p>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Grid */}
      {!loading && filteredQuizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => (
            <Card key={quiz.id} hover className="flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">{quiz.title}</h3>
                  <Badge variant={quiz.difficulty}>{quiz.difficulty}</Badge>
                </div>
                {quiz.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{quiz.description}</p>}
                <div className="grid grid-cols-3 gap-3 text-center text-xs mb-4">
                  <div>
                    <div className="font-semibold text-gray-900">{quiz.questionsCount || '-'}</div>
                    <div className="text-gray-400">Questions</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{quiz.avgScore || 0}%</div>
                    <div className="text-gray-400">Avg Score</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{quiz.attempts || 0}</div>
                    <div className="text-gray-400">Attempts</div>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  <Avatar username={quiz.creator || ''} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{quiz.creator}</div>
                    <div className="text-xs text-gray-400">{quiz.created ? new Date(quiz.created).toLocaleDateString() : ''}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleStart(quiz)}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Play
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredQuizzes.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No quizzes found"
          description="Try adjusting your filters or search terms."
          action={<button onClick={clearFilters} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Clear Filters</button>}
        />
      )}
    </div>
  );
}
