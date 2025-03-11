'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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
    <header className="bg-indigo-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center "
      style={{
        display:"flex",
        justifyContent:"space-around",
        flexDirection:"row",
      }}
      >
        {/* Logo and Company Name on the Left */}
        <div className="flex items-center mr-auto">
          <img src="/images/logo.png" alt="Logo" className="h-8" />
        </div>
        
        {/* Admin Panel and Auth Links on the Right */}
        <div className="flex items-center space-x-4 ml-auto">
          {token && (
            <>
              <Link href="/change-password" className="ml-4">Change Password</Link>
              <button onClick={handleLogout} className="ml-4">Logout</button>
            </>
          )}
          <Link href="/" className="text-xl font-bold text-blue-300" style={{
            fontSize:"1.5rem",
            color:'blue',
            fontWeight:"bold",
            textDecoration:"none",
          }}>Admin Panel</Link>
        </div>
      </div>
    </header>
  );
}
