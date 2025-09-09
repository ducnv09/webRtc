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
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  const peerConnections = useRef<Map<string, PeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const { socket } = useSocket('video');
  const { participants, participantCount, isConnected } = useVideoParticipants(socket, roomId);

  // Debug: Log khi localStream thay đổi
  useEffect(() => {
    console.log('localStream changed:', localStream);
  }, [localStream]);

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

    // Lấy localStream từ ref để tránh re-create function
    const currentLocalStream = localStreamRef.current;
    if (currentLocalStream) {
      currentLocalStream.getTracks().forEach(track => {
        pc.addTrack(track, currentLocalStream);
      });
    }

    const peerConnection: PeerConnection = { pc, userId };
    peerConnections.current.set(userId, peerConnection);

    return pc;
  }, [socket, roomId]); // Bỏ localStream khỏi dependency

  const startCall = useCallback(async () => {
    try {
      console.log('Starting video call for room:', roomId);

      // Kiểm tra xem đã join room chưa để tránh join nhiều lần
      if (hasJoinedRoom) {
        console.log('Already joined room, skipping...');
        return;
      }

      // Emit join-video-room event first, regardless of media access
      if (socket) {
        console.log('Emitting join-video-room event for room:', roomId);
        socket.emit('join-video-room', { roomId });
        setHasJoinedRoom(true);
      } else {
        console.error('Socket not available when trying to join video room');
        return;
      }

      // Try to get media stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, // Luôn yêu cầu video
          audio: true, // Luôn yêu cầu audio
        });

        // Thiết lập trạng thái ban đầu cho tracks
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        if (videoTrack) {
          videoTrack.enabled = isVideoEnabled;
        }
        if (audioTrack) {
          audioTrack.enabled = isAudioEnabled;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;
        console.log('Media stream obtained successfully');

        // Đồng bộ trạng thái với tracks thực tế
        if (videoTrack) setIsVideoEnabled(videoTrack.enabled);
        if (audioTrack) setIsAudioEnabled(audioTrack.enabled);
      } catch (mediaError) {
        console.error('Error accessing media devices:', mediaError);
        // Continue without media stream - user can still see others
      }
    } catch (error) {
      console.error('Error in startCall:', error);
    }
  }, [socket, roomId, hasJoinedRoom, isVideoEnabled, isAudioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    if (videoTrack.enabled) {
      // Tắt video - chỉ disable track
      videoTrack.enabled = false;
      setIsVideoEnabled(false);
    } else {
      // Bật video lại - cần tạo track mới vì track cũ có thể đã bị dừng
      try {
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // Không lấy audio mới
        });

        const newVideoTrack = newVideoStream.getVideoTracks()[0];
        const currentAudioTrack = localStream.getAudioTracks()[0];

        // Tạo stream mới với video track mới và audio track cũ
        const updatedStream = new MediaStream();
        if (newVideoTrack) updatedStream.addTrack(newVideoTrack);
        if (currentAudioTrack) updatedStream.addTrack(currentAudioTrack);

        // Cập nhật peer connections với video track mới
        peerConnections.current.forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && newVideoTrack) {
            sender.replaceTrack(newVideoTrack);
          }
        });

        // Dừng video track cũ và cập nhật stream
        videoTrack.stop();
        setLocalStream(updatedStream);
        localStreamRef.current = updatedStream;
        setIsVideoEnabled(true);
      } catch (error) {
        console.error('Error enabling video:', error);
        // Fallback: thử enable track cũ
        videoTrack.enabled = true;
        setIsVideoEnabled(true);
      }
    }
  }, [localStream, peerConnections]);

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
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // Không lấy audio mới
        });

        // Tạo stream mới với camera video và audio hiện tại
        const newStream = new MediaStream();
        const newVideoTrack = cameraStream.getVideoTracks()[0];
        const currentAudioTrack = localStream?.getAudioTracks()[0];

        if (newVideoTrack) newStream.addTrack(newVideoTrack);
        if (currentAudioTrack) newStream.addTrack(currentAudioTrack);

        // Update local stream
        setLocalStream(newStream);
        localStreamRef.current = newStream;
        setIsScreenSharing(false);

        // Update all peer connections with new video track
        peerConnections.current.forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && newVideoTrack) {
            sender.replaceTrack(newVideoTrack);
          }
        });

        // Dừng screen track cũ
        if (localStream) {
          localStream.getVideoTracks().forEach(track => track.stop());
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false, // Không lấy audio từ screen
        });

        // Tạo stream mới với screen video và audio hiện tại
        const newStream = new MediaStream();
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const currentAudioTrack = localStream?.getAudioTracks()[0];

        if (screenVideoTrack) newStream.addTrack(screenVideoTrack);
        if (currentAudioTrack) newStream.addTrack(currentAudioTrack);

        // Update local stream
        setLocalStream(newStream);
        localStreamRef.current = newStream;
        setIsScreenSharing(true);

        // Update all peer connections with screen video track
        peerConnections.current.forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && screenVideoTrack) {
            sender.replaceTrack(screenVideoTrack);
          }
        });

        // Handle screen share end
        screenVideoTrack.onended = () => {
          setIsScreenSharing(false);
          // Return to camera when screen sharing ends
          navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          }).then(cameraStream => {
            const returnStream = new MediaStream();
            const cameraVideoTrack = cameraStream.getVideoTracks()[0];
            const currentAudio = newStream.getAudioTracks()[0];

            if (cameraVideoTrack) returnStream.addTrack(cameraVideoTrack);
            if (currentAudio) returnStream.addTrack(currentAudio);

            setLocalStream(returnStream);
            localStreamRef.current = returnStream;
            // Update peer connections
            peerConnections.current.forEach(({ pc }) => {
              const sender = pc.getSenders().find(s => s.track?.kind === 'video');
              if (sender && cameraVideoTrack) {
                sender.replaceTrack(cameraVideoTrack);
              }
            });
          });
        };
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }, [isScreenSharing, localStream]);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }

    peerConnections.current.forEach(({ pc }) => {
      pc.close();
    });
    peerConnections.current.clear();
    setRemoteStreams(new Map());
    setHasJoinedRoom(false); // Reset join status

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