'use client';
import React, { useEffect, useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useRoom } from '../../hooks/useGraphQL';
import { useAuthContext } from '../../providers/AuthProvider';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';
import { ChatSidebar } from './ChatSidebar';
import { ParticipantsList } from './ParticipantsList';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';

interface VideoCallRoomProps {
  roomId: string;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ roomId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const router = useRouter();
  const { user } = useAuthContext();
  const { room, loading: roomLoading } = useRoom(roomId);
  const {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    participants,
    participantCount,
    isConnected,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    shareScreen,
  } = useWebRTC(roomId);

  useEffect(() => {
    if (room) {
      startCall();
    }

    return () => {
      endCall();
    };
  }, [room?.id]); // Chỉ phụ thuộc vào room.id để tránh re-run không cần thiết

  if (roomLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Phòng không tồn tại</h2>
          <p className="text-gray-600 mb-4">Phòng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Quay về Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-lg font-semibold">{room.name}</h1>
          <p className="text-gray-400 text-sm">
            {isConnected && participantCount > 0 ? participantCount : room.members.length} thành viên
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </button>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Video Area */}
        <div className="video-area">
          <div className="video-grid-container">
            <VideoGrid
              localStream={localStream}
              remoteStreams={remoteStreams}
              isVideoEnabled={isVideoEnabled}
              currentUser={user}
              participants={participants}
              roomMembers={room?.members || []}
            />
          </div>

          <div className="control-bar">
            <ControlBar
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
              onToggleVideo={toggleVideo}
              onToggleAudio={toggleAudio}
              onShareScreen={shareScreen}
              onEndCall={endCall}
              roomId={roomId}
              isRoomOwner={room?.creatorId === user?.id}
            />
          </div>
        </div>

        {/* Sidebar */}
        {(isChatOpen || isParticipantsOpen) && (
          <div className="w-80 bg-white border-l border-gray-200">
            {isChatOpen && (
              <ChatSidebar
                roomId={roomId}
                onClose={() => setIsChatOpen(false)}
              />
            )}
            {isParticipantsOpen && (
              <ParticipantsList
                participants={room.members}
                onlineParticipants={participants}
                participantCount={participantCount}
                onClose={() => setIsParticipantsOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};