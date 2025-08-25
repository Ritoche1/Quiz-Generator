// File: quiz-generator/src/components/Navigation.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function Navigation({ user, onRedoQuiz, onNewQuiz }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [quizHistory, setQuizHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        if(user) {
            setLoadingHistory(true);
            fetchHistory();
        } else {
            setQuizHistory([]);
            setLoadingHistory(false);
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${baseUrl}/scores/user/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('quizToken')}`
                }
            });
            const data = await response.json();
            setQuizHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleDelete = async (scoreId) => {
        try {
            await fetch(`${baseUrl}/scores/${scoreId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('quizToken')}`
                }
            });
            setQuizHistory(prev => prev.filter(item => item.score_id !== scoreId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleRedo = async (quizId) => {
        setIsMenuOpen(false);
        try {
            const response = await fetch(`${baseUrl}/quizzes/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('quizToken')}`
                }
            });
            const quizData = await response.json();
            onRedoQuiz(quizData);
        } catch (error) {
            console.error('Redo failed:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('quizToken');
        window.location.reload();
    };

    return (
        <nav className="w-full nav-glass fixed top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {user && (
                        // Left Side - Menu and Actions
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => {
                                    if (!isMenuOpen) fetchHistory();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                className="btn-ghost p-2"
                                aria-label="Open menu"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            <button
                                onClick={onNewQuiz}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>New Quiz</span>
                            </button>
                        </div>
                    )}

                    {/* Center - Brand */}
                    <div className="flex-1 flex justify-center">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">Q</span>
                            </div>
                            <span className="text-white font-bold text-xl hidden sm:block">
                                Quiz Generator
                            </span>
                        </Link>
                    </div>

                    {user && (
                        // Right Side - User Menu
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-2 text-white">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium">
                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <span className="hidden sm:block font-medium">
                                    {user?.username || 'User'}
                                </span>
                            </div>
                            
                            <button
                                onClick={handleLogout}
                                className="btn-ghost text-red-300 hover:text-red-200 hover:bg-red-500/20"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {!user && (
                        <div className="flex-1 flex justify-end">
                            <Link href="/" className="btn-secondary">
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced History Sidebar */}
            {isMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-16 w-80 glass-card m-4 max-h-[80vh] overflow-hidden z-50">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span>📊</span>
                                Quiz History
                            </h3>
                        </div>
                        
                        <div className="overflow-y-auto max-h-96 p-6">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="loading-spinner"></div>
                                    <span className="ml-2 text-gray-600">Loading...</span>
                                </div>
                            ) : quizHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">🎯</div>
                                    <p className="text-gray-600">No quizzes taken yet</p>
                                    <p className="text-sm text-gray-500">Start by creating your first quiz!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quizHistory.map((quiz, index) => (
                                        <div key={index} className="card p-4 group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800 mb-1">
                                                        {quiz.title}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <span>{quiz.difficulty === 'easy' ? '🟢' : quiz.difficulty === 'medium' ? '🟡' : '🔴'}</span>
                                                            {quiz.difficulty}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            🌐 {quiz.language}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-indigo-600">
                                                            Score: {quiz.score}/{quiz.max_score}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(quiz.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                    <button
                                                        onClick={() => handleRedo(quiz.quiz_id)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                                        title="Redo quiz"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(quiz.score_id)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Delete record"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}