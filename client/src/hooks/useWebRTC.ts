import { useRef, useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import { useVideoParticipants } from './useVideoParticipants';

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
}

export const useWebRTC = (roomId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [remoteScreenShares, setRemoteScreenShares] = useState<Map<string, MediaStream>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  const peerConnections = useRef<Map<string, PeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
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
      console.log('Received remote stream from user:', userId);
      setRemoteStreams(prev => new Map(prev.set(userId, remoteStream)));
    };

    // Không add tracks ở đây nữa - sẽ add ở nơi gọi createPeerConnection
    console.log('Created peer connection for user:', userId);

    const peerConnection: PeerConnection = { pc, userId };
    peerConnections.current.set(userId, peerConnection);

    return pc;
  }, [socket, roomId]);

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

      // Không tự động lấy media stream khi join phòng
      // User sẽ phải bật camera/mic thủ công
      console.log('Joined room successfully. Camera and mic are disabled by default.');
    } catch (error) {
      console.error('Error in startCall:', error);
    }
  }, [socket, roomId, hasJoinedRoom]);

  const toggleVideo = useCallback(async () => {
    // Nếu không có localStream, thử tạo video stream mới
    if (!localStream) {
      try {
        console.log('No local stream, trying to create video stream...');
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setLocalStream(videoStream);
        localStreamRef.current = videoStream;
        setIsVideoEnabled(true);

        // Thêm video track vào tất cả peer connections
        peerConnections.current.forEach(({ pc }) => {
          const videoTrack = videoStream.getVideoTracks()[0];
          if (videoTrack) {
            pc.addTrack(videoTrack, videoStream);
          }
        });

        console.log('Video stream created successfully');
        return;
      } catch (error) {
        console.error('Cannot create video stream:', error);
        alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera hoặc đóng các ứng dụng khác đang sử dụng camera.');
        return;
      }
    }

    const videoTrack = localStream.getVideoTracks()[0];

    // Nếu không có video track, thử tạo mới
    if (!videoTrack) {
      try {
        console.log('No video track, trying to add video...');
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        const newVideoTrack = videoStream.getVideoTracks()[0];
        const currentAudioTrack = localStream.getAudioTracks()[0];

        // Tạo stream mới với video track mới và audio track cũ
        const updatedStream = new MediaStream();
        if (newVideoTrack) updatedStream.addTrack(newVideoTrack);
        if (currentAudioTrack) updatedStream.addTrack(currentAudioTrack);

        // Cập nhật peer connections với video track mới
        peerConnections.current.forEach(({ pc }) => {
          if (newVideoTrack) {
            pc.addTrack(newVideoTrack, updatedStream);
          }
        });

        setLocalStream(updatedStream);
        localStreamRef.current = updatedStream;
        setIsVideoEnabled(true);
        console.log('Video track added successfully');
        return;
      } catch (error) {
        console.error('Cannot add video track:', error);
        alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera hoặc đóng các ứng dụng khác đang sử dụng camera.');
        return;
      }
    }

    // Toggle video track hiện có
    if (videoTrack.enabled) {
      // Tắt video - chỉ disable track
      videoTrack.enabled = false;
      setIsVideoEnabled(false);
      console.log('Video disabled');
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
          } else if (newVideoTrack) {
            // Nếu không có sender, thêm track mới
            pc.addTrack(newVideoTrack, updatedStream);
          }
        });

        // Dừng video track cũ và cập nhật stream
        videoTrack.stop();
        setLocalStream(updatedStream);
        localStreamRef.current = updatedStream;
        setIsVideoEnabled(true);
        console.log('Video enabled successfully');
      } catch (error) {
        console.error('Error enabling video:', error);
        // Fallback: thử enable track cũ
        try {
          videoTrack.enabled = true;
          setIsVideoEnabled(true);
          console.log('Video enabled using existing track');
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          alert('Không thể bật camera. Vui lòng kiểm tra quyền truy cập camera hoặc đóng các ứng dụng khác đang sử dụng camera.');
        }
      }
    }
  }, [localStream, peerConnections]);

  const toggleAudio = useCallback(async () => {
    // Nếu không có localStream, thử tạo audio stream mới
    if (!localStream) {
      try {
        console.log('No local stream, trying to create audio stream...');
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });

        setLocalStream(audioStream);
        localStreamRef.current = audioStream;
        setIsAudioEnabled(true);

        // Thêm audio track vào tất cả peer connections
        peerConnections.current.forEach(({ pc }) => {
          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            pc.addTrack(audioTrack, audioStream);
          }
        });

        console.log('Audio stream created successfully');
        return;
      } catch (error) {
        console.error('Cannot create audio stream:', error);
        alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập microphone.');
        return;
      }
    }

    const audioTrack = localStream.getAudioTracks()[0];

    // Nếu không có audio track, thử tạo mới
    if (!audioTrack) {
      try {
        console.log('No audio track, trying to add audio...');
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });

        const newAudioTrack = audioStream.getAudioTracks()[0];
        const currentVideoTrack = localStream.getVideoTracks()[0];

        // Tạo stream mới với audio track mới và video track cũ
        const updatedStream = new MediaStream();
        if (currentVideoTrack) updatedStream.addTrack(currentVideoTrack);
        if (newAudioTrack) updatedStream.addTrack(newAudioTrack);

        // Cập nhật peer connections với audio track mới
        peerConnections.current.forEach(({ pc }) => {
          if (newAudioTrack) {
            pc.addTrack(newAudioTrack, updatedStream);
          }
        });

        setLocalStream(updatedStream);
        localStreamRef.current = updatedStream;
        setIsAudioEnabled(true);
        console.log('Audio track added successfully');
        return;
      } catch (error) {
        console.error('Cannot add audio track:', error);
        alert('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập microphone.');
        return;
      }
    }

    // Toggle audio track hiện có
    audioTrack.enabled = !audioTrack.enabled;
    setIsAudioEnabled(audioTrack.enabled);
    console.log('Audio toggled:', audioTrack.enabled);
  }, [localStream, peerConnections]);

  const shareScreen = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing - chỉ dừng screen share stream
        if (screenShareStream) {
          screenShareStream.getTracks().forEach(track => track.stop());
          setScreenShareStream(null);
        }
        setIsScreenSharing(false);

        // Thông báo cho peers về việc dừng screen share
        if (socket) {
          socket.emit('screen-share-stopped', { roomId });
        }
      } else {
        // Start screen sharing - tạo stream riêng biệt
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true, // Có thể lấy audio từ screen
        });

        setScreenShareStream(screenStream);
        setIsScreenSharing(true);

        // Thông báo cho peers về screen share mới
        if (socket) {
          socket.emit('screen-share-started', { roomId });
        }

        // Tạo peer connections riêng cho screen share
        peerConnections.current.forEach(async ({ pc, userId }) => {
          const screenVideoTrack = screenStream.getVideoTracks()[0];
          const screenAudioTrack = screenStream.getAudioTracks()[0];

          if (screenVideoTrack) {
            pc.addTrack(screenVideoTrack, screenStream);
          }
          if (screenAudioTrack) {
            pc.addTrack(screenAudioTrack, screenStream);
          }

          // Tạo offer cho screen share
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          if (socket) {
            socket.emit('screen-share-offer', {
              roomId,
              targetPeerId: userId,
              offer: offer,
            });
          }
        });

        // Handle screen share end
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        if (screenVideoTrack) {
          screenVideoTrack.onended = () => {
            setIsScreenSharing(false);
            setScreenShareStream(null);
            if (socket) {
              socket.emit('screen-share-stopped', { roomId });
            }
          };
        }
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  }, [isScreenSharing, screenShareStream, socket, roomId]);

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
      console.log('Peer joined:', peerId);
      const pc = createPeerConnection(peerId);

      // Đảm bảo local stream được add vào peer connection
      const currentLocalStream = localStreamRef.current;
      if (currentLocalStream && currentLocalStream.getTracks().length > 0) {
        console.log('Adding local tracks to new peer connection');
        currentLocalStream.getTracks().forEach(track => {
          try {
            pc.addTrack(track, currentLocalStream);
            console.log(`Added ${track.kind} track to new peer connection`);
          } catch (error) {
            console.error(`Error adding ${track.kind} track to new peer:`, error);
          }
        });
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('video-offer', {
        roomId,
        targetPeerId: peerId,
        offer,
      });
    });

    socket.on('video-offer', async ({ offer, peerId }) => {
      console.log('Received video offer from:', peerId);
      const pc = createPeerConnection(peerId);

      // Đảm bảo local stream được add vào peer connection
      const currentLocalStream = localStreamRef.current;
      if (currentLocalStream && currentLocalStream.getTracks().length > 0) {
        console.log('Adding local tracks to answering peer connection');
        currentLocalStream.getTracks().forEach(track => {
          try {
            pc.addTrack(track, currentLocalStream);
            console.log(`Added ${track.kind} track to answering peer connection`);
          } catch (error) {
            console.error(`Error adding ${track.kind} track to answering peer:`, error);
          }
        });
      }

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
  };
};