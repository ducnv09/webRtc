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
    screenShareStream,
    remoteStreams,
    remoteScreenShares,
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


      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Video Area */}
        <div className="video-area">
          <div className="video-grid-container">
            <VideoGrid
              localStream={localStream}
              screenShareStream={screenShareStream}
              remoteStreams={remoteStreams}
              remoteScreenShares={remoteScreenShares}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
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
              roomName={room.name}
              participantCount={isConnected && participantCount > 0 ? participantCount : room.members.length}
              isConnected={isConnected}
              onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
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