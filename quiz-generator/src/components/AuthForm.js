'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({onLogin}) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

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
            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            if (isLogin) {
                localStorage.setItem('quizToken', data.access_token);
                router.refresh();
                onLogin();
            } else {
                setIsLogin(true); // Switch to login after successful registration
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg text-black">
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 p-2 ${isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 p-2 ${!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
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
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                />
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                >
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>
        </div>
    );
}