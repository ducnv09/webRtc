'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function HomePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Simple check for token without complex auth logic
      const token = localStorage.getItem('accessToken');
      console.log('Token exists:', !!token);

      if (token) {
        console.log('Redirecting to dashboard');
        router.replace('/dashboard');
      } else {
        console.log('Redirecting to login');
        router.replace('/login');
      }
    }
  }, [isClient, router]);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">WebRTC Video Call</h1>
        <p className="text-gray-600 mb-8">Đang chuyển hướng...</p>
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}