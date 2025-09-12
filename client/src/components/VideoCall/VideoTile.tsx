import React, { useRef, useEffect, useState } from 'react';

interface VideoTileProps {
  stream: MediaStream | null;
  isLocal: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled?: boolean;
  username: string;
  avatar?: string | null;
  isScreenShare?: boolean;
}

const VideoTileComponent: React.FC<VideoTileProps> = ({
  stream,
  isLocal,
  isVideoEnabled,
  isAudioEnabled: propIsAudioEnabled,
  username,
  avatar,
  isScreenShare = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detectedAudioEnabled, setDetectedAudioEnabled] = useState(true);

  // Sử dụng prop nếu có, nếu không thì dùng detected state
  const currentAudioEnabled = propIsAudioEnabled !== undefined ? propIsAudioEnabled : detectedAudioEnabled;

  useEffect(() => {
    if (videoRef.current && stream) {
      // Chỉ set srcObject nếu nó thực sự khác
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream, isLocal]);

  useEffect(() => {
    // Chỉ detect audio cho remote streams (không có prop isAudioEnabled)
    if (propIsAudioEnabled === undefined && stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        setDetectedAudioEnabled(audioTrack.enabled);

        // Listen for track enabled/disabled changes
        const handleTrackChange = () => {
          setDetectedAudioEnabled(audioTrack.enabled);
        };

        // Polling để check audio track status (vì không có event cho enabled change)
        const interval = setInterval(handleTrackChange, 100);

        return () => {
          clearInterval(interval);
        };
      }
    }

    // Return empty cleanup function if no cleanup needed
    return () => {};
  }, [stream, propIsAudioEnabled]);

  return (
    <div
      className={`video-tile relative bg-gray-800 rounded-lg overflow-hidden ${
        isScreenShare ? 'screen-share-tile' : 'aspect-video min-h-0'
      }`}
      style={isScreenShare ? {
        height: '100%',
        width: '100%',
        aspectRatio: 'unset',
        minHeight: 'unset',
        maxHeight: 'none'
      } : {}}
    >
      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full ${
            isScreenShare ? 'object-contain bg-black' : 'object-cover'
          }`}
          style={isScreenShare ? {
            objectFit: 'contain',
            width: '100%',
            height: '100%'
          } : {}}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-700">
          <div className="text-center">
            {avatar ? (
              <img
                src={avatar}
                alt={username}
                className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-2xl">
                <span className="text-white text-4xl font-bold tracking-wide">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

          </div>
        </div>
      )}
      
      {/* Username overlay - ở góc trái dưới */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-end justify-between">
          <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
            {username}{isLocal && ' (Bạn)'}
          </span>
          <div className="flex items-center space-x-1">
            {!currentAudioEnabled && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              </div>
            )}
            {!isVideoEnabled && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize component để tránh re-render không cần thiết
export const VideoTile = React.memo(VideoTileComponent, (prevProps, nextProps) => {
  // Chỉ re-render khi các props quan trọng thay đổi
  return (
    prevProps.stream === nextProps.stream &&
    prevProps.isVideoEnabled === nextProps.isVideoEnabled &&
    prevProps.isAudioEnabled === nextProps.isAudioEnabled &&
    prevProps.username === nextProps.username &&
    prevProps.avatar === nextProps.avatar &&
    prevProps.isLocal === nextProps.isLocal &&
    prevProps.isScreenShare === nextProps.isScreenShare
  );
});