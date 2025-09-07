import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../lib/socket';

export const useSocket = (namespace: 'chat' | 'video') => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let socketInstance: Socket;

    if (namespace === 'chat') {
      socketInstance = socketService.connectChat(token);
    } else {
      socketInstance = socketService.connectVideo(token);
    }

    socketInstance.on('connect', () => {
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      if (namespace === 'chat') {
        socketService.disconnectChat();
      } else {
        socketService.disconnectVideo();
      }
      setSocket(null);
      setConnected(false);
    };
  }, [namespace]);

  return { socket, connected };
};