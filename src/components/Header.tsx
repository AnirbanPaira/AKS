'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const { token, setToken } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        console.log('Logout successful');
        setToken(null);
        router.replace('/');
        router.refresh();
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header style={{
      color: 'white',
      padding: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
      }}>
        {/* Logo and Company Name on the Left */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <img 
            src="/images/logo.png" 
            alt="Logo" 
            style={{
              height: '40px',
              marginRight: '12px',
            }} 
          />
        </div>

        {/* Admin Panel and Auth Links on the Right */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}>
          {token ? (
            <>
              <Link 
                href="/change-password" 
                style={{
                  color: 'black',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transition: 'background-color 0.2s',
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{marginRight: '6px'}}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  <circle cx="12" cy="16" r="1"></circle>
                </svg>
                Change Password
              </Link>
              <button 
                onClick={handleLogout} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'black',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s',
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{marginRight: '6px'}}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/" 
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#93c5fd', // blue-300
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{marginRight: '8px'}}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}