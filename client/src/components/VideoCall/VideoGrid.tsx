import React, { useState } from 'react';
import { VideoTile } from './VideoTile';
import { User } from '../../types/auth';

interface Participant {
  peerId: string;
  userId: string | null;
}

interface VideoGridProps {
  localStream: MediaStream | null;
  screenShareStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  remoteScreenShares: Map<string, MediaStream>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  currentUser: User | null;
  participants: Participant[];
  roomMembers: any[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  screenShareStream,
  remoteStreams,
  remoteScreenShares,
  isVideoEnabled,
  isAudioEnabled,
  currentUser,
  participants,
  roomMembers,
}) => {
  // State để quản lý video được focus (phóng to)
  const [focusedVideo, setFocusedVideo] = useState<{
    stream: MediaStream | null;
    username: string;
    avatar?: string | null;
    isScreenShare?: boolean;
    isLocal?: boolean;
    peerId?: string;
    id: string;
  } | null>(null);

  // Tính tổng số streams
  const allStreams = [];

  // Thêm local camera
  if (localStream && currentUser) {
    allStreams.push({
      stream: localStream,
      username: currentUser.username,
      avatar: currentUser.avatar,
      isLocal: true,
      isScreenShare: false,
      id: 'local-camera'
    });
  }

  // Thêm local screen share
  if (screenShareStream && currentUser) {
    allStreams.push({
      stream: screenShareStream,
      username: `${currentUser.username} (Screen)`,
      avatar: currentUser.avatar,
      isLocal: true,
      isScreenShare: true,
      id: 'local-screen'
    });
  }

  // Thêm remote cameras
  Array.from(remoteStreams.entries()).forEach(([peerId, stream]) => {
    const participant = participants.find(p => p.peerId === peerId);
    const userInfo = participant ? getUserInfo(participant.userId) : null;
    allStreams.push({
      stream,
      username: userInfo ? userInfo.username : `User ${peerId.slice(0, 8)}`,
      avatar: userInfo ? userInfo.avatar : null,
      isLocal: false,
      isScreenShare: false,
      peerId,
      id: `remote-camera-${peerId}`
    });
  });

  // Thêm remote screen shares
  Array.from(remoteScreenShares.entries()).forEach(([peerId, stream]) => {
    const participant = participants.find(p => p.peerId === peerId);
    const userInfo = participant ? getUserInfo(participant.userId) : null;
    allStreams.push({
      stream,
      username: userInfo ? `${userInfo.username} (Screen)` : `User ${peerId.slice(0, 8)} (Screen)`,
      avatar: userInfo ? userInfo.avatar : null,
      isLocal: false,
      isScreenShare: true,
      peerId,
      id: `remote-screen-${peerId}`
    });
  });

  const getGridClass = () => {
    const totalStreams = allStreams.length;
    if (totalStreams <= 1) return 'grid-cols-1';
    if (totalStreams <= 4) return 'grid-cols-2';
    if (totalStreams <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const handleVideoClick = (videoData: any) => {
    // Nếu chỉ có 1 video thì không cho phép focus
    if (allStreams.length <= 1) {
      return;
    }

    if (focusedVideo && focusedVideo.id === videoData.id) {
      // Click vào video đang được focus → quay về layout grid
      setFocusedVideo(null);
    } else {
      // Click vào video khác → focus video đó
      setFocusedVideo(videoData);
    }
  };

  // Helper function để lấy thông tin user từ userId
  const getUserInfo = (userId: string | null) => {
    if (!userId) return null;

    // Tìm user trong roomMembers
    const member = roomMembers.find(member => member.user.id === userId);
    return member ? member.user : null;
  };

  // Nếu có video được focus - hiển thị layout focus
  if (focusedVideo) {
    const otherStreams = allStreams.filter(s => s.id !== focusedVideo.id);

    return (
      <div className="h-full w-full overflow-hidden">
        <div className="flex h-full w-full gap-4 p-4">
          {/* Video được focus - chiếm phần lớn màn hình */}
          <div className="flex-1 h-full min-w-0 video-focused-main">
            <div
              className={`h-full ${allStreams.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => handleVideoClick(focusedVideo)}
            >
              <VideoTile
                stream={focusedVideo.stream}
                isLocal={focusedVideo.isLocal || false}
                isVideoEnabled={focusedVideo.isLocal ? (focusedVideo.isScreenShare ? true : isVideoEnabled) : true}
                isAudioEnabled={focusedVideo.isLocal ? isAudioEnabled : true}
                isScreenShare={focusedVideo.isScreenShare || false}
                username={focusedVideo.username}
                avatar={focusedVideo.avatar}
              />
            </div>
          </div>

          {/* Các video khác ở sidebar */}
          {otherStreams.length > 0 && (
            <div className="w-64 h-full flex flex-col gap-2 overflow-y-auto video-focused-sidebar">
              {otherStreams.map((videoData) => (
                <div
                  key={videoData.id}
                  className={`aspect-video flex-shrink-0 ${allStreams.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => handleVideoClick(videoData)}
                >
                  <VideoTile
                    stream={videoData.stream}
                    isLocal={videoData.isLocal || false}
                    isVideoEnabled={videoData.isLocal ? (videoData.isScreenShare ? true : isVideoEnabled) : true}
                    isAudioEnabled={videoData.isLocal ? isAudioEnabled : true}
                    isScreenShare={videoData.isScreenShare || false}
                    username={videoData.username}
                    avatar={videoData.avatar}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout bình thường - grid tất cả videos
  return (
    <div className="h-full p-4 overflow-hidden">
      <div className={`video-grid grid ${getGridClass()} gap-4 h-full`}>
        {allStreams.map((videoData) => (
          <div
            key={videoData.id}
            className={allStreams.length > 1 ? 'cursor-pointer' : 'cursor-default'}
            onClick={() => handleVideoClick(videoData)}
          >
            <VideoTile
              stream={videoData.stream}
              isLocal={videoData.isLocal || false}
              isVideoEnabled={videoData.isLocal ? (videoData.isScreenShare ? true : isVideoEnabled) : true}
              isAudioEnabled={videoData.isLocal ? isAudioEnabled : true}
              isScreenShare={videoData.isScreenShare || false}
              username={videoData.username}
              avatar={videoData.avatar}
            />
          </div>
        ))}
      </div>
    </div>
  );
};