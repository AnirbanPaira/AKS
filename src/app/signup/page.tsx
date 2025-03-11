'use client';
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                // Sign-up successful, handle token and redirect
                const responseData = await res.json(); // Parse JSON response
                const token = responseData.token; // Extract token from response
                if (token) {
                    localStorage.setItem('authToken', token); // Store token in localStorage
                    console.log('Sign up successful, token stored in localStorage');
                    router.push('/dashboard'); // Redirect to dashboard
                    router.refresh(); // Force re-render to update header text
                } else {
                    console.error('Token not received in signup response');
                    setError('Signup failed: Token missing');
                }
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            setError('Failed to sign up. Please try again later.');
        }
    };

    return (
        <main className="min-h-screen p-4 flex justify-center items-center">
            <div className="max-w-md w-full mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h1>
                <p className="text-gray-700 text-center mb-4">Sign up to get started.</p>
                <Link href="/" className="block text-center font-bold text-sm text-blue-500 hover:text-blue-800 mb-4">
                    Already have an account? Sign In
                </Link>
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                id="password"
                                placeholder="Enter your password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-500 hover:text-gray-700"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    {passwordVisible ? (
                                        <path
                                            fillRule="evenodd"
                                            d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1110.586 10.586zM10 11a1 1 0 100-2 1 1 0 000 2z"
                                            clipRule="evenodd"
                                        />
                                    ) : (
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    )}
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.707l4.293-4.414a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.414a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm italic">{error}</p>}
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
