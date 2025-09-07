import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../services/message.service';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { MessageType } from '../graphql/types/message.type';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private messageService: MessageService) {}

  async handleConnection(client: Socket) {
    console.log(`Chat client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-chat-room')
  @UseGuards(WsJwtGuard)
  async handleJoinChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(`chat-${data.roomId}`);
    client.emit('joined-chat-room', { roomId: data.roomId });
  }

  @SubscribeMessage('leave-chat-room')
  async handleLeaveChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(`chat-${data.roomId}`);
    client.emit('left-chat-room', { roomId: data.roomId });
  }

  @SubscribeMessage('send-chat-message')
  @UseGuards(WsJwtGuard)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: MessageType },
  ) {
    try {
      const userId = client.data.user.userId;
      const message = await this.messageService.createMessage(
        {
          content: data.content,
          type: data.type || MessageType.TEXT,
          roomId: data.roomId,
        },
        userId,
      );

      this.server.to(`chat-${data.roomId}`).emit('new-chat-message', message);
    } catch (error) {
      client.emit('chat-error', { message: error.message });
    }
  }

  @SubscribeMessage('typing-start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; username: string },
  ) {
    client.to(`chat-${data.roomId}`).emit('user-typing', {
      userId: client.data.user?.userId,
      username: data.username,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing-stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.to(`chat-${data.roomId}`).emit('user-typing', {
      userId: client.data.user?.userId,
      isTyping: false,
    });
  }
}