'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../providers/AuthProvider';
import { Layout } from '../../components/layout/Layout';
import { RoomList } from '../../components/dashboard/RoomList';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user.username}!
          </h1>
          <p className="text-gray-600">
            Tham gia hoặc tạo phòng video call mới
          </p>
        </div>
        <RoomList />
      </div>
    </Layout>
  );
}