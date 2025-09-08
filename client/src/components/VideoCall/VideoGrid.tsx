import React from 'react';
import { VideoTile } from './VideoTile';
import { User } from '../../types/auth';

interface Participant {
  peerId: string;
  userId: string | null;
}

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isVideoEnabled: boolean;
  currentUser: User | null;
  participants: Participant[];
  roomMembers: any[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  isVideoEnabled,
  currentUser,
  participants,
  roomMembers,
}) => {
  const totalStreams = (localStream ? 1 : 0) + remoteStreams.size;

  const getGridClass = () => {
    if (totalStreams <= 1) return 'grid-cols-1';
    if (totalStreams <= 4) return 'grid-cols-2';
    if (totalStreams <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Helper function để lấy thông tin user từ userId
  const getUserInfo = (userId: string | null) => {
    if (!userId) return null;

    // Tìm user trong roomMembers
    const member = roomMembers.find(member => member.user.id === userId);
    return member ? member.user : null;
  };

  return (
    <div className="flex-1 p-4 overflow-hidden">
      <div className={`grid ${getGridClass()} gap-4 h-full`}>
        {localStream && currentUser && (
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isVideoEnabled}
            username={currentUser.username}
            avatar={currentUser.avatar}
          />
        )}

        {Array.from(remoteStreams.entries()).map(([peerId, stream]) => {
          // Tìm participant tương ứng với peerId
          const participant = participants.find(p => p.peerId === peerId);
          const userInfo = participant ? getUserInfo(participant.userId) : null;

          return (
            <VideoTile
              key={peerId}
              stream={stream}
              isLocal={false}
              isVideoEnabled={true}
              username={userInfo ? userInfo.username : `User ${peerId.slice(0, 8)}`}
              avatar={userInfo ? userInfo.avatar : null}
            />
          );
        })}
      </div>
    </div>
  );
};