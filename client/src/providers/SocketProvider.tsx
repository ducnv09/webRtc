'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  chatSocket: Socket | null;
  videoSocket: Socket | null;
  chatConnected: boolean;
  videoConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { socket: chatSocket, connected: chatConnected } = useSocket('chat');
  const { socket: videoSocket, connected: videoConnected } = useSocket('video');

  return (
    <SocketContext.Provider value={{
      chatSocket,
      videoSocket,
      chatConnected,
      videoConnected,
    }}>
      {children}
    </SocketContext.Provider>
  );
};