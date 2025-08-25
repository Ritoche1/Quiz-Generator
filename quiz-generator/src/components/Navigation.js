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
        <nav className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 fixed top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {user && (
                        // Burger Menu - Left Side
                        <div className="flex-1 flex items-center">
                        <button
                            onClick={() => {
                                if (!isMenuOpen) fetchHistory();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="text-white hover:bg-white/10 p-2 rounded-lg"
                            aria-label="Open menu"
                            >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {/* New Quiz Button*/}
                        <button
                            onClick={onNewQuiz}
                            className="text-white hover:bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                            <span>+</span>
                            <span>Quiz</span>
                        </button>
                    </div>
                    )}

                    {/* Centered Title */}
                    <div className="flex-1 flex justify-center">
                        <div className="text-white font-bold text-xl absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            Mistral AI Quiz Generator
                        </div>
                    </div>

                    {user && (
                        // Profile & Logout - Right Side
                        <div className="flex-1 flex items-center justify-end gap-4 ml-auto">
                        <button className="text-white hover:bg-white/10 p-2 rounded-lg">
                            {user?.username || 'Profile'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                            >
                            Logout
                        </button>
                        </div>
                    )}

                    {!user && (
                        // Login Button - Right Side
                        <div className="flex-1 flex items-center justify-end gap-4 ml-auto">
                            <Link href="/" className="text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* History Sidebar */}
            {isMenuOpen && (
                <div className="absolute left-0 top-16 w-72 bg-white shadow-lg rounded-r-lg p-4 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Quiz History</h3>
                    {loadingHistory ? (
                        <p className="text-gray-600">Loading...</p>
                    ) : quizHistory.length === 0 ? (
                        <p className="text-gray-600">No quizzes taken yet</p>
                    ) : (
                        <ul className="space-y-3">
                            {quizHistory.map((quiz, index) => (
                                <li key={index} className="bg-gray-50 p-3 rounded-lg relative group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{quiz.title} - {quiz.difficulty}</h4>
                                            <p className="text-sm text-gray-600">
                                                Score: {quiz.score}/{quiz.max_score}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(quiz.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleRedo(quiz.quiz_id)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                title="Redo quiz"
                                            >
                                                ↺
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz.score_id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                                title="Delete record"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </nav>
    );
}