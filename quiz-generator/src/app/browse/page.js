'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function BrowseQuizzes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [addingToCart, setAddingToCart] = useState(null);
  const router = useRouter();
  const { addToCart } = useCart();

  const languages = ['all', 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Turkish', 'Polish'];

  useEffect(() => {
    checkAuth();
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterAndSortQuizzes();
  }, [quizzes, searchTerm, selectedDifficulty, selectedLanguage, sortBy]);

  const checkAuth = async () => {
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
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    setLoading(false);
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${baseUrl}/quizzes/browse/public`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // For now, set empty array if API fails
      setQuizzes([]);
    }
  };

  const filterAndSortQuizzes = () => {
    let filtered = quizzes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === selectedDifficulty);
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(quiz => quiz.language === selectedLanguage);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.attempts - a.attempts;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'score':
          return b.avgScore - a.avgScore;
        case 'created':
        default:
          return new Date(b.created) - new Date(a.created);
      }
    });

    setFilteredQuizzes(filtered);
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '🟢';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const handleStartQuiz = (quiz) => {
    const token = localStorage.getItem('quizToken');
    if (!token) {
      // Redirect unauthenticated users to login page with return path
      const returnTo = encodeURIComponent(`/browse`);
      router.push(`/?redirect=${returnTo}`);
      return;
    }
    router.push(`/?quiz=${quiz.id}`);
  };

  const handleAddToCart = async (quiz) => {
    setAddingToCart(quiz.id);
    
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addToCart(quiz, 9.99); // $9.99 per quiz
    setAddingToCart(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-default gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24 safe-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-3">
              <span>🎯</span>
              Browse Quizzes
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Discover and take quizzes created by the community
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔍 Search
                </label>
                <input
                  type="text"
                  placeholder="Search quizzes, topics, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ⚡ Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🌐 Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="form-select"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === 'all' ? 'All Languages' : lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📊 Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="created">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="score">Highest Score</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-white/80 dark:text-gray-300">
              Found {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''}
            </p>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="card hover-lift">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
                        {quiz.description}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      <span className="mr-1">{getDifficultyIcon(quiz.difficulty)}</span>
                      {quiz.difficulty}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-indigo-600">{quiz.questionsCount}</div>
                      <div className="text-xs text-gray-500">Questions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{quiz.avgScore}%</div>
                      <div className="text-xs text-gray-500">Avg Score</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{quiz.attempts}</div>
                      <div className="text-xs text-gray-500">Attempts</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quiz.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg dark:bg-gray-700 dark:text-gray-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {quiz.creator.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{quiz.creator}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(quiz.created).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(quiz)}
                        disabled={addingToCart === quiz.id}
                        className="btn-ghost-light px-3 py-2 text-sm flex items-center gap-2"
                        title="Add to cart ($9.99)"
                      >
                        {addingToCart === quiz.id ? (
                          <>
                            <div className="loading-spinner w-3 h-3"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                            $9.99
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Start Quiz
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredQuizzes.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-2">No quizzes found</h3>
              <p className="text-white/70 mb-8">
                Try adjusting your search filters or browse all quizzes
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty('all');
                  setSelectedLanguage('all');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}