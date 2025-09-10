import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketEventService {
  private chatServer: Server | null = null;
  private videoServer: Server | null = null;

  setChatServer(server: Server) {
    this.chatServer = server;
  }

  setVideoServer(server: Server) {
    this.videoServer = server;
  }

  emitChatMessage(roomId: string, message: any) {
    if (this.chatServer) {
      this.chatServer.to(`chat-${roomId}`).emit('new-chat-message', message);
    }
  }

  emitVideoEvent(roomId: string, event: string, data: any) {
    if (this.videoServer) {
      this.videoServer.to(`video-${roomId}`).emit(event, data);
    }
  }
}
