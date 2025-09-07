import React from 'react';
import { VideoTile } from './VideoTile';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isVideoEnabled: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  isVideoEnabled,
}) => {
  const totalStreams = (localStream ? 1 : 0) + remoteStreams.size;
  
  const getGridClass = () => {
    if (totalStreams <= 1) return 'grid-cols-1';
    if (totalStreams <= 4) return 'grid-cols-2';
    if (totalStreams <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="flex-1 p-4">
      <div className={`grid ${getGridClass()} gap-4 h-full`}>
        {localStream && (
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isVideoEnabled}
            username="Bạn"
          />
        )}
        
        {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
          <VideoTile
            key={userId}
            stream={stream}
            isLocal={false}
            isVideoEnabled={true}
            username={`User ${userId.slice(0, 8)}`}
          />
        ))}
      </div>
    </div>
  );
};