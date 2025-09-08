import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface Participant {
  peerId: string;
  userId: string | null;
}

interface UseVideoParticipantsReturn {
  participants: Participant[];
  participantCount: number;
  isConnected: boolean;
}

export const useVideoParticipants = (
  socket: Socket | null,
  roomId: string
): UseVideoParticipantsReturn => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      console.log('No socket available for video participants');
      return;
    }

    console.log('Setting up video participants event listeners for room:', roomId);

    // Lắng nghe khi có người tham gia
    socket.on('peer-joined', ({ peerId, userId }) => {
      console.log('Peer joined:', { peerId, userId });
      setParticipants(prev => {
        // Kiểm tra xem peer đã tồn tại chưa
        const exists = prev.some(p => p.peerId === peerId);
        if (exists) return prev;

        const newParticipants = [...prev, { peerId, userId }];
        console.log('Updated participants:', newParticipants);
        return newParticipants;
      });
    });

    // Lắng nghe khi có người rời khỏi phòng
    socket.on('peer-disconnected', ({ peerId }) => {
      setParticipants(prev => {
        const newParticipants = prev.filter(p => p.peerId !== peerId);
        return newParticipants;
      });
    });

    // Lắng nghe danh sách peers hiện có khi join room
    socket.on('room-peers', ({ peers }) => {
      setParticipants(peers || []);
    });

    // Lắng nghe cập nhật số lượng thành viên real-time
    socket.on('room-participants-count', ({ count, roomId: eventRoomId }) => {
      console.log('Received room-participants-count:', { count, eventRoomId, currentRoomId: roomId });
      // Chỉ cập nhật nếu event thuộc về room hiện tại
      if (eventRoomId === roomId) {
        console.log('Setting participant count to:', count);
        setParticipantCount(count);
      }
    });

    // Lắng nghe trạng thái kết nối
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setParticipants([]);
      setParticipantCount(0);
    });

    // Cleanup function
    return () => {
      socket.off('peer-joined');
      socket.off('peer-disconnected');
      socket.off('room-peers');
      socket.off('room-participants-count');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, roomId]);



  // Backup: Cập nhật participantCount dựa trên participants nếu không nhận được từ server
  useEffect(() => {
    if (isConnected && participants.length >= 0) {
      const calculatedCount = participants.length + 1; // +1 cho bản thân
      console.log('Calculated participant count:', calculatedCount, 'Current count:', participantCount);

      // Chỉ cập nhật nếu count hiện tại là 0 hoặc khác với calculated count
      if (participantCount === 0 || Math.abs(participantCount - calculatedCount) > 0) {
        console.log('Updating participant count from', participantCount, 'to', calculatedCount);
        setParticipantCount(calculatedCount);
      }
    }
  }, [participants, isConnected]);

  return {
    participants,
    participantCount,
    isConnected,
  };
};
