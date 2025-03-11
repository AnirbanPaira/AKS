'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from '../ChangePasswordPage.module.css'; // You'll need to create this CSS module

const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    currentPassword: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleInputChange = (field, value) => {
    // Clear validation errors when user types
    setValidationErrors({
      ...validationErrors,
      [field]: ''
    });

    // Update state based on field
    switch (field) {
      case 'currentPassword':
        setCurrentPassword(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      email: '',
      newPassword: '',
      confirmPassword: ''
    };

    // Validate email
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate current password
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, and a number';
      isValid = false;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message); // Success message from API
      } else {
        setMessage(data.message || 'Failed to change password.'); // Error message from API or default
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.changePwdPage}>
      <div className={styles.changePwdCard}>
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
          <h1 className={styles.title}>Change Password</h1>
          <p className={styles.subtitle}>Update your account password</p>
        </div>
        
        <form onSubmit={handleChangePassword} className={styles.form}>
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
            <label htmlFor="currentPassword" className={styles.inputLabel}>Current Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="currentPassword"
                placeholder="••••••••"
                className={`${styles.input} ${validationErrors.currentPassword ? styles.inputError : ''}`}
                value={currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
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
            {validationErrors.currentPassword && (
              <p className={styles.validationError}>{validationErrors.currentPassword}</p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.inputLabel}>New Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="newPassword"
                placeholder="••••••••"
                className={`${styles.input} ${validationErrors.newPassword ? styles.inputError : ''}`}
                value={newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                required
              />
            </div>
            {validationErrors.newPassword && (
              <p className={styles.validationError}>{validationErrors.newPassword}</p>
            )}
            <p className={styles.passwordHint}>
              Must be at least 8 characters with uppercase, lowercase, and a number
            </p>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm New Password</label>
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
          
          {message && (
            <div className={message.includes('success') || message.includes('Success') 
              ? styles.successMessage 
              : styles.errorMessage}>
              <svg className={message.includes('success') || message.includes('Success') 
                ? styles.successIcon 
                : styles.errorIcon} 
                viewBox="0 0 20 20" 
                fill="currentColor">
                {message.includes('success') || message.includes('Success') ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              <p>{message}</p>
            </div>
          )}
          
          <button
            className={`${styles.changePasswordButton} ${isLoading ? styles.buttonLoading : ''}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingContent}>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating password...
              </span>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChangePasswordPage;