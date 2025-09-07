'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '../../../providers/AuthProvider';
import { VideoCallRoom } from '../../../components/VideoCall/VideoCallRoom';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export default function RoomPage() {
  const { roomId } = useParams();
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

  return <VideoCallRoom roomId={roomId as string} />;
}