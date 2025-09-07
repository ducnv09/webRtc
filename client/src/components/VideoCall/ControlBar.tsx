import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

interface ControlBarProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onShareScreen: () => void;
  onEndCall: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onShareScreen,
  onEndCall,
}) => {
  const router = useRouter();

  const handleEndCall = () => {
    onEndCall();
    router.push('/dashboard');
  };

  return (
    <div className="bg-gray-800 px-6 py-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isAudioEnabled
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {isAudioEnabled ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isVideoEnabled
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          {isVideoEnabled ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={onShareScreen}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isScreenSharing
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18" />
          </svg>
        </button>
      </div>
    </div>
  );
};