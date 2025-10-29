'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from './Navigation';

export default function NavigationClient({ user, onRedoQuiz, onNewQuiz }) {
    const [quizHistory, setQuizHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setLoadingHistory(true);
            fetchHistory();
        } else {
            setQuizHistory([]);
            setLoadingHistory(false);
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';
            const response = await fetch(`${baseUrl}/scores/user/history`, {
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('quizToken') : ''}`
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
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';
            await fetch(`${baseUrl}/scores/${scoreId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('quizToken') : ''}`
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
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';
            const response = await fetch(`${baseUrl}/quizzes/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('quizToken') : ''}`
                }
            });
            const quizData = await response.json();
            if (typeof onRedoQuiz === 'function') {
                onRedoQuiz(quizData);
            }
        } catch (error) {
            console.error('Redo failed:', error);
        }
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('quizToken');
            window.location.reload();
        }
    };

    return (
        <Navigation
            user={user}
            onRedoQuiz={onRedoQuiz}
            onNewQuiz={onNewQuiz}
            quizHistory={quizHistory}
            loadingHistory={loadingHistory}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            fetchHistory={fetchHistory}
            handleDelete={handleDelete}
            handleRedo={handleRedo}
            handleLogout={handleLogout}
        />
    );
}
