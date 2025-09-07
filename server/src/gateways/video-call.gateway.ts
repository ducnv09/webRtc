import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';

type SdpOffer = RTCSessionDescriptionInit; // hoặc tự định nghĩa interface tối thiểu
type SdpAnswer = RTCSessionDescriptionInit;
type IceCandidate = RTCIceCandidateInit;

@WebSocketGateway({
  namespace: '/video-call',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class VideoCallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Set<string>> = new Map(); // roomId -> socketId set
  private socketUser = new Map<string, string>();      // socketId -> userId (tuỳ chọn)

  async handleConnection(client: Socket) {
    // Có thể log nhẹ, tránh lộ thông tin trong prod
    // console.log(`Video call client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    // console.log(`Video call client disconnected: ${client.id}`);
    // Dọn set phòng + thông báo rời
    for (const [roomId, participants] of this.rooms) {
      if (participants.delete(client.id)) {
        this.server.to(roomId).emit('peer-disconnected', { peerId: client.id });
        if (participants.size === 0) this.rooms.delete(roomId);
      }
    }
    this.socketUser.delete(client.id);
  }

  @SubscribeMessage('join-video-room')
  @UseGuards(WsJwtGuard)
  async handleJoinVideoRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const roomId = `video-${data.roomId}`;
      const userId: string | undefined = client.data.user?.userId;

      if (!roomId) throw new Error('Missing roomId');
      if (!userId) throw new Error('Unauthorized user');

      if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
      const participants = this.rooms.get(roomId)!;

      participants.add(client.id);
      client.join(roomId);

      if (userId) this.socketUser.set(client.id, userId);

      // Thông báo người khác trong phòng
      client.to(roomId).emit('peer-joined', {
        peerId: client.id,
        userId,
      });

      // Gửi danh sách peer hiện có cho người mới
      const peers = Array.from(participants)
        .filter((id) => id !== client.id)
        .map((id) => ({ peerId: id, userId: this.socketUser.get(id) ?? null }));
      client.emit('room-peers', { peers });
    } catch (err: any) {
      client.emit('video-error', { message: err?.message ?? 'Join room failed' });
    }
  }

  @SubscribeMessage('leave-video-room')
  @UseGuards(WsJwtGuard)
  async handleLeaveVideoRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const roomId = `video-${data.roomId}`;
      client.leave(roomId);

      const participants = this.rooms.get(roomId);
      if (participants?.delete(client.id)) {
        this.server.to(roomId).emit('peer-disconnected', { peerId: client.id });
        if (participants.size === 0) this.rooms.delete(roomId);
      }
    } catch (err: any) {
      client.emit('video-error', { message: err?.message ?? 'Leave room failed' });
    }
  }

  private ensureSameRoom(senderId: string, targetId: string, roomId: string): boolean {
    const participants = this.rooms.get(roomId);
    return !!participants && participants.has(senderId) && participants.has(targetId);
  }

  private socketExists(id: string): boolean {
    // Mỗi socket tự là 1 room trong adapter, kiểm tra tồn tại nhanh:
    return this.server.sockets.adapter.rooms.has(id);
  }

  @SubscribeMessage('video-offer')
  @UseGuards(WsJwtGuard)
  async handleVideoOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetPeerId: string; offer: SdpOffer },
  ) {
    try {
      const roomId = `video-${data.roomId}`;
      if (!data?.targetPeerId || !data?.offer) throw new Error('Invalid offer payload');
      if (data.targetPeerId === client.id) throw new Error('Cannot send to self');
      if (!this.socketExists(data.targetPeerId)) throw new Error('Target peer not found');
      if (!this.ensureSameRoom(client.id, data.targetPeerId, roomId)) {
        throw new Error('Peers are not in the same room');
      }

      client.to(data.targetPeerId).emit('video-offer', {
        offer: data.offer,
        peerId: client.id,
      });
    } catch (err: any) {
      client.emit('video-error', { message: err?.message ?? 'Offer failed' });
    }
  }

  @SubscribeMessage('video-answer')
  @UseGuards(WsJwtGuard)
  async handleVideoAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetPeerId: string; answer: SdpAnswer },
  ) {
    try {
      const roomId = `video-${data.roomId}`;
      if (!data?.targetPeerId || !data?.answer) throw new Error('Invalid answer payload');
      if (data.targetPeerId === client.id) throw new Error('Cannot send to self');
      if (!this.socketExists(data.targetPeerId)) throw new Error('Target peer not found');
      if (!this.ensureSameRoom(client.id, data.targetPeerId, roomId)) {
        throw new Error('Peers are not in the same room');
      }

      client.to(data.targetPeerId).emit('video-answer', {
        answer: data.answer,
        peerId: client.id,
      });
    } catch (err: any) {
      client.emit('video-error', { message: err?.message ?? 'Answer failed' });
    }
  }

  @SubscribeMessage('ice-candidate')
  @UseGuards(WsJwtGuard)
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; targetPeerId: string; candidate: IceCandidate },
  ) {
    try {
      const roomId = `video-${data.roomId}`;
      if (!data?.targetPeerId || !data?.candidate) throw new Error('Invalid ICE payload');
      if (data.targetPeerId === client.id) throw new Error('Cannot send to self');
      if (!this.socketExists(data.targetPeerId)) throw new Error('Target peer not found');
      if (!this.ensureSameRoom(client.id, data.targetPeerId, roomId)) {
        throw new Error('Peers are not in the same room');
      }

      client.to(data.targetPeerId).emit('ice-candidate', {
        candidate: data.candidate,
        peerId: client.id,
      });
    } catch (err: any) {
      client.emit('video-error', { message: err?.message ?? 'ICE failed' });
    }
  }
}
