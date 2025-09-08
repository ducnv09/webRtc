import { useRef, useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { useVideoParticipants } from './useVideoParticipants';

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
}

export const useWebRTC = (roomId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnections = useRef<Map<string, PeerConnection>>(new Map());
  const { socket } = useSocket('video');
  const { participants, participantCount, isConnected } = useVideoParticipants(socket, roomId);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const createPeerConnection = useCallback((userId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: userId,
          roomId,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    const peerConnection: PeerConnection = { pc, userId };
    peerConnections.current.set(userId, peerConnection);

    return pc;
  }, [socket, roomId, localStream]);

  const startCall = useCallback(async () => {
    try {
      console.log('Starting video call for room:', roomId);

      // Emit join-video-room event first, regardless of media access
      if (socket) {
        console.log('Emitting join-video-room event for room:', roomId);
        socket.emit('join-video-room', { roomId });
      } else {
        console.error('Socket not available when trying to join video room');
        return;
      }

      // Try to get media stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        console.log('Media stream obtained successfully');
      } catch (mediaError) {
        console.error('Error accessing media devices:', mediaError);
        // Continue without media stream - user can still see others
      }
    } catch (error) {
      console.error('Error in startCall:', error);
    }
  }, [socket, roomId]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  const shareScreen = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing - return to camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Update local stream
        setLocalStream(stream);
        setIsScreenSharing(false);

        // Update all peer connections with new stream
        peerConnections.current.forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && stream.getVideoTracks()[0]) {
            sender.replaceTrack(stream.getVideoTracks()[0]);
          }
        });
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Update local stream
        setLocalStream(screenStream);
        setIsScreenSharing(true);

        // Update all peer connections with screen stream
        peerConnections.current.forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && screenStream.getVideoTracks()[0]) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });

        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          // Return to camera when screen sharing ends
          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          }).then(stream => {
            setLocalStream(stream);
            // Update peer connections
            peerConnections.current.forEach(({ pc }) => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video');
              if (sender && stream.getVideoTracks()[0]) {
                sender.replaceTrack(stream.getVideoTracks()[0]);
              }
            });
          });
        };
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }, [isScreenSharing]);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    peerConnections.current.forEach(({ pc }) => {
      pc.close();
    });
    peerConnections.current.clear();
    setRemoteStreams(new Map());

    if (socket) {
      socket.emit('leave-video-room', { roomId });
    }
  }, [localStream, socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('peer-joined', async ({ peerId }) => {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('video-offer', {
        roomId,
        targetPeerId: peerId,
        offer,
      });
    });

    socket.on('video-offer', async ({ offer, peerId }) => {
      const pc = createPeerConnection(peerId);
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('video-answer', {
        roomId,
        targetPeerId: peerId,
        answer,
      });
    });

    socket.on('video-answer', async ({ answer, peerId }) => {
      const peerConnection = peerConnections.current.get(peerId);
      if (peerConnection) {
        await peerConnection.pc.setRemoteDescription(answer);
      }
    });

    socket.on('ice-candidate', async ({ candidate, peerId }) => {
      const peerConnection = peerConnections.current.get(peerId);
      if (peerConnection) {
        await peerConnection.pc.addIceCandidate(candidate);
      }
    });

    socket.on('peer-disconnected', ({ peerId }) => {
      const peerConnection = peerConnections.current.get(peerId);
      if (peerConnection) {
        peerConnection.pc.close();
        peerConnections.current.delete(peerId);
      }
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(peerId);
        return newMap;
      });
    });

    // Lắng nghe khi chủ phòng kết thúc cuộc gọi
    socket.on('room-ended-by-owner', (data: { roomId: string; message: string }) => {
      console.log('Room ended by owner:', data);
      alert(data.message);
      endCall();
      // Redirect về dashboard
      window.location.href = '/dashboard';
    });

    return () => {
      socket.off('peer-joined');
      socket.off('video-offer');
      socket.off('video-answer');
      socket.off('ice-candidate');
      socket.off('peer-disconnected');
      socket.off('room-ended-by-owner');
    };
  }, [socket, createPeerConnection, roomId]);

  return {
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
  };
};