'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../providers/AuthProvider';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}