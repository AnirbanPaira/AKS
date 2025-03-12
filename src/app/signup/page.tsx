'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../SignupPage.module.css'; // We'll create this CSS module

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const router = useRouter();

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /\d/.test(password);
    };

    const handleInputChange = (field, value) => {
        // Clear validation errors when user types
        setValidationErrors({
            ...validationErrors,
            [field]: ''
        });

        // Update state based on field
        switch (field) {
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                break;
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: ''
        };

        // Validate email
        if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Validate password
        if (!validatePassword(password)) {
            newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number';
            isValid = false;
        }

        // Validate confirm password
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setValidationErrors(newErrors);
        return isValid;
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

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
                const responseData = await res.json();
                const token = responseData.token;
                if (token) {
                    localStorage.setItem('authToken', token);
                    console.log('Sign up successful, token stored in localStorage');
                    router.push('/dashboard');
                    router.refresh();
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.signupPage}>
            <div className={styles.signupCard}>
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
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Sign up to get started</p>
                </div>
                
                <form onSubmit={handleSignUp} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="your@email.com"
                            className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                            value={email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                        />
                        {validationErrors.email && (
                            <p className={styles.validationError}>{validationErrors.email}</p>
                        )}
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.inputLabel}>Password</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                id="password"
                                placeholder="••••••••"
                                className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                                value={password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
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
                        {validationErrors.password && (
                            <p className={styles.validationError}>{validationErrors.password}</p>
                        )}
                        <p className={styles.passwordHint}>
                            Must be at least 8 characters with uppercase, lowercase, and a number
                        </p>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm Password</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={passwordVisible ? 'text' : 'password'}
                                id="confirmPassword"
                                placeholder="••••••••"
                                className={`${styles.input} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
                                value={confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                required
                            />
                        </div>
                        {validationErrors.confirmPassword && (
                            <p className={styles.validationError}>{validationErrors.confirmPassword}</p>
                        )}
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
                        className={`${styles.signUpButton} ${isLoading ? styles.buttonLoading : ''}`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loadingContent}>
                                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </span>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>
                
                <div className={styles.loginSection}>
                    <Link href="/" className={styles.loginLink}>
                        Already have an account? Sign In
                    </Link>
                </div>
            </div>
        </main>
    );
}