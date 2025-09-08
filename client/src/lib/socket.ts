import { io, Socket } from 'socket.io-client';

class SocketService {
  private chatSocket: Socket | null = null;
  private videoSocket: Socket | null = null;

  connectChat(token: string): Socket {
    if (this.chatSocket?.connected) {
      return this.chatSocket;
    }

    this.chatSocket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.chatSocket.on('connect', () => {
      console.log('Chat socket connected');
    });

    this.chatSocket.on('disconnect', () => {
      console.log('Chat socket disconnected');
    });

    return this.chatSocket;
  }

  connectVideo(token: string): Socket {
    if (this.videoSocket?.connected) {
      console.log('Video socket already connected');
      return this.videoSocket;
    }

    console.log('Connecting to video socket...');
    this.videoSocket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/video-call`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.videoSocket.on('connect', () => {
      console.log('Video socket connected');
    });

    this.videoSocket.on('disconnect', () => {
      console.log('Video socket disconnected');
    });

    this.videoSocket.on('connect_error', (error) => {
      console.error('Video socket connection error:', error);
    });

    return this.videoSocket;
  }

  disconnectChat() {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }
  }

  disconnectVideo() {
    if (this.videoSocket) {
      this.videoSocket.disconnect();
      this.videoSocket = null;
    }
  }

  getChatSocket(): Socket | null {
    return this.chatSocket;
  }

  getVideoSocket(): Socket | null {
    return this.videoSocket;
  }
}

export const socketService = new SocketService();