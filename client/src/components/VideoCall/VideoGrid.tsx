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
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  currentUser: User | null;
  participants: Participant[];
  roomMembers: any[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  currentUser,
  participants,
  roomMembers,
}) => {
  const totalStreams = (localStream ? 1 : 0) + remoteStreams.size;

  const getGridClass = () => {
    // Nếu đang screen share, sử dụng layout đặc biệt
    if (isScreenSharing) {
      return totalStreams > 1 ? 'grid-cols-4' : 'grid-cols-1';
    }

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

  if (isScreenSharing) {
    // Layout đặc biệt cho screen sharing - full screen
    return (
      <div className="h-full w-full overflow-hidden">
        <div className="flex h-full w-full">
          {/* Screen share takes main area - full size */}
          {localStream && currentUser && (
            <div className="flex-1 h-full min-w-0">
              <VideoTile
                stream={localStream}
                isLocal={true}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                isScreenShare={true}
                username={currentUser.username}
                avatar={currentUser.avatar}
              />
            </div>
          )}

          {/* Remote streams in sidebar - only if there are remote streams */}
          {remoteStreams.size > 0 && (
            <div className="w-64 h-full flex flex-col gap-2 p-2 overflow-y-auto bg-gray-900">
              {Array.from(remoteStreams.entries()).map(([peerId, stream]) => {
                const participant = participants.find(p => p.peerId === peerId);
                const userInfo = participant ? getUserInfo(participant.userId) : null;

                return (
                  <div key={peerId} className="aspect-video flex-shrink-0">
                    <VideoTile
                      stream={stream}
                      isLocal={false}
                      isVideoEnabled={true}
                      username={userInfo ? userInfo.username : `User ${peerId.slice(0, 8)}`}
                      avatar={userInfo ? userInfo.avatar : null}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout bình thường
  return (
    <div className="h-full p-4 overflow-hidden">
      <div className={`video-grid grid ${getGridClass()} gap-4 h-full`}>
        {localStream && currentUser && (
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            isScreenShare={false}
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