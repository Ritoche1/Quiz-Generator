'use client';
import { useState } from 'react';

export default function AuthForm({onLogin}) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    // Removed useRouter to keep component test-friendly

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        let url = '/auth/register';
        let body =  JSON.stringify({ username, email, password });
        let headers = { 'Content-Type': 'application/json' };
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';
        
        if (isLogin) {
            url = '/auth/login';
            body = new URLSearchParams({ username : email, password });
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        }


        try {
            const response = await fetch(baseUrl + url, {
                method: 'POST',
                headers: headers,
                body: body
            });

            const data = await response.json();
            if (!response.ok) {
                // Handle different error types more specifically
                if (data.detail) {
                    throw new Error(data.detail);
                }
                throw new Error(data.error || 'Something went wrong');
            }

            if (isLogin) {
                localStorage.setItem('quizToken', data.access_token);
                // Notify app shell and parent without full reload
                try { onLogin?.(); } catch {}
                try { window.dispatchEvent(new CustomEvent('auth-login')); } catch {}
            } else {
                setIsLogin(true); // Switch to login after successful registration
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full max-w-md glass-card p-6 rounded-2xl text-black">
            <div className="flex gap-3 mb-6">
                <button 
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 px-4 py-2 rounded-lg ${isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 px-4 py-2 rounded-lg ${!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Register
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                />
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    className="w-full btn-primary"
                >
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>
        </div>
    );
}