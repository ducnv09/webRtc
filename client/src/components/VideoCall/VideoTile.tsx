import React, { useRef, useEffect, useState } from 'react';

interface VideoTileProps {
  stream: MediaStream;
  isLocal: boolean;
  isVideoEnabled: boolean;
  username: string;
  avatar?: string | null;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  isLocal,
  isVideoEnabled,
  username,
  avatar,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Check audio track status
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [stream]);

  return (
    <div className="video-tile relative bg-gray-800 rounded-lg overflow-hidden aspect-video min-h-0">
      {isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-end justify-between">
          <span className="text-white text-sm font-medium bg-black/30 px-2 py-1 rounded">
            {username}
          </span>
          <div className="flex items-center space-x-1">
            {!isAudioEnabled && (
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