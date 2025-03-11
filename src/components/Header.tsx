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
        setToken(null); // Clear token from context and localStorage - let context handle local storage
        router.replace('/'); // Use replace instead of push
        router.refresh(); // Force re-render to update header text
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Admin Panel</Link>
        <nav>
          {token ? (
            <>
              <Link href="/change-password" className="ml-4">Change Password</Link>
              <button onClick={handleLogout} className="ml-4">Logout</button>
            </>
          ) : (
            <></>
          )}
        </nav>
      </div>
    </header>
  );
}
