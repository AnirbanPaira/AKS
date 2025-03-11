"use client";

import React, { useState } from 'react';

const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.');
      return;
    }

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
    }
  };

  return (
    <div className="container mx-auto mt-10 p-8 bg-white shadow-md rounded-md max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h1>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">
            Current Password:
          </label>
          <input
            type="password"
            id="currentPassword"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">
            New Password:
          </label>
          <input
            type="password"
            id="newPassword"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
            Confirm New Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Change Password
          </button>
        </div>
        {message && <p className={message.startsWith('Failed') || message.startsWith('Incorrect') ? 'text-red-500 text-sm' : 'text-green-500 text-sm'}>{message}</p>}
      </form>
    </div>
  );
};

export default ChangePasswordPage;
