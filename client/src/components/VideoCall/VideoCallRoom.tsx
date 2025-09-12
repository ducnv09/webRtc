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
import { useMutation, useSubscription } from '@apollo/client';
import { JOIN_ROOM_MUTATION } from '../../graphql/mutations/rooms';
import { USER_JOINED_ROOM_SUBSCRIPTION, ROOM_UPDATED_SUBSCRIPTION } from '../../graphql/subscriptions/rooms';

interface VideoCallRoomProps {
  roomId: string;
}

export const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ roomId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const router = useRouter();
  const { user } = useAuthContext();
  const { room, loading: roomLoading, refetch: refetchRoom } = useRoom(roomId);
  const [joinRoom] = useMutation(JOIN_ROOM_MUTATION);

  // Subscribe to user joined room events
  const { data: userJoinedData } = useSubscription(USER_JOINED_ROOM_SUBSCRIPTION, {
    variables: { roomId },
    skip: !roomId,
  });

  // Subscribe to room updates
  const { data: roomUpdatedData } = useSubscription(ROOM_UPDATED_SUBSCRIPTION, {
    variables: { roomId },
    skip: !roomId,
  });
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

  // Handle user joined room subscription
  useEffect(() => {
    if (userJoinedData?.userJoinedRoom) {
      console.log('User joined room via subscription:', userJoinedData.userJoinedRoom);
      // Refetch room data để cập nhật members
      refetchRoom();
    }
  }, [userJoinedData, refetchRoom]);

  // Handle room updated subscription
  useEffect(() => {
    if (roomUpdatedData?.roomUpdated) {
      console.log('Room updated via subscription:', roomUpdatedData.roomUpdated);
      // Refetch room data để cập nhật members
      refetchRoom();
    }
  }, [roomUpdatedData, refetchRoom]);

  useEffect(() => {
    const handleJoinRoom = async () => {
      if (room && user) {
        console.log('Current room members:', room.members);
        console.log('Current user:', user);

        // Kiểm tra xem user đã là member chưa
        const isAlreadyMember = room.members.some((member: any) => member.user.id === user.id);
        console.log('Is already member:', isAlreadyMember);

        if (!isAlreadyMember) {
          try {
            console.log('User not a member, joining room via GraphQL...');
            await joinRoom({ variables: { roomId } });
            // Refetch room data để cập nhật members
            await refetchRoom();
            console.log('Successfully joined room via GraphQL');
          } catch (error) {
            console.error('Error joining room via GraphQL:', error);
          }
        }

        // Start video call
        startCall();
      }
    };

    handleJoinRoom();

    return () => {
      endCall();
    };
  }, [room?.id, user?.id]); // Phụ thuộc vào room.id và user.id



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
              onToggleParticipants={() => {
                if (isParticipantsOpen) {
                  // Nếu đang mở participants thì đóng
                  setIsParticipantsOpen(false);
                } else {
                  // Nếu đang đóng participants thì mở và đóng chat
                  setIsParticipantsOpen(true);
                  setIsChatOpen(false);
                }
              }}
              onToggleChat={() => {
                if (isChatOpen) {
                  // Nếu đang mở chat thì đóng
                  setIsChatOpen(false);
                } else {
                  // Nếu đang đóng chat thì mở và đóng participants
                  setIsChatOpen(true);
                  setIsParticipantsOpen(false);
                }
              }}

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