'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './LoginPage.module.css'; // We'll create this CSS module

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isInitialRender) {
            setIsInitialRender(false);
            return;
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            router.push('/dashboard');
        }
    }, [router, isInitialRender]);

    const handleSignIn = async (event: React.FormEvent) => {
        console.log('handleSignIn called');
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const responseData = await res.json();
                const token = responseData.token;
                if (token) {
                    localStorage.setItem('authToken', token);
                    console.log('Sign in successful, token stored in localStorage');
                    router.push('/dashboard');
                    router.refresh();
                } else {
                    console.error('Token not received in sign-in response');
                    setError('Sign-in failed: Token missing');
                }
            } else {
                const errorData = await res.json();
                console.log('Sign-in failed:', errorData);
                setError(errorData.message || 'Sign-in failed');
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            setError('Failed to sign in. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.headerSection}>
                    <div className={styles.iconContainer}>
                        <Image 
                            src="/images/lock-image.png" 
                            alt="Lock Icon" 
                            width={32} 
                            height={32}
                            className={styles.lockIcon} 
                        />
                    </div>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to access your dashboard</p>
                </div>
                
                <form onSubmit={handleSignIn} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="your@email.com"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.inputLabel}>Password</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                id="password"
                                placeholder="••••••••"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={styles.visibilityToggle}
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                            >
                                {passwordVisible ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {error && (
                        <div className={styles.errorMessage}>
                            <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    <button
                        className={`${styles.signInButton} ${isLoading ? styles.buttonLoading : ''}`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loadingContent}>
                                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
                
                <div className={styles.signupSection}>
                    <Link href="/signup" className={styles.signupLink}>
                        Don&#39;t have an account? Sign Up
                    </Link>
                </div>
                
                <div className={styles.forgotPasswordSection}>
                    <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                        Forgot your password?
                    </Link>
                </div>
            </div>
        </main>
    );
}