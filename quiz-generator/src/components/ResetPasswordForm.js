'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ? `${process.env.NEXT_PUBLIC_BASE_URL}` : 'http://localhost:5000';

export default function ResetPasswordForm() {
    const [step, setStep] = useState('request');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
            setToken(tokenParam);
            setStep('verify');
        }
    }, []);

    const resetFeedback = () => {
        setError('');
        setMessage('');
    };

    const handleRequest = async (event) => {
        event.preventDefault();
        resetFeedback();
        setIsLoading(true);

        try {
            const response = await fetch(`${baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Unable to process password reset request.');
            }

            setMessage(data.message || 'If the email exists, we just sent reset instructions. Check your inbox.');
            setStep('request_sent');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (event) => {
        event.preventDefault();
        resetFeedback();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token.trim()) {
            setError('Reset token is required.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${baseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token.trim(), password: newPassword })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to reset password.');
            }

            setMessage(data.message || 'Password updated successfully.');
            setStep('success');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg text-black">
            <h1 className="text-2xl font-semibold text-center mb-6">Reset password</h1>

            {message && <p className="mb-4 text-green-600 text-sm">{message}</p>}
            {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}

            {step === 'request' && (
                <form onSubmit={handleRequest} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full p-2 border rounded-lg"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending instructions...' : 'Send reset link'}
                    </button>
                </form>
            )}

            {step === 'verify' && (
                <form onSubmit={handleReset} className="space-y-4">
                    <p className="text-sm text-gray-600">Choose your new password.</p>
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium mb-1">New password</label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm new password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Reset password'}
                    </button>
                </form>
            )}

            {step === 'request_sent' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Please check your email for a password reset link. Click the link in the email to proceed with resetting your password.
                    </p>
                </div>
            )}

            {step === 'success' && (
                <div className="space-y-4 text-center">
                    <p>Your password has been updated. You can now log in with the new credentials.</p>
                    <Link href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Return to login
                    </Link>
                </div>
            )}

            {step !== 'success' && (
                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-blue-600 hover:underline">
                        Back to login
                    </Link>
                </div>
            )}
        </div>
    );
}
