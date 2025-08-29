import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateMessageInput } from '../graphql/inputs/message.input';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(input: CreateMessageInput, userId: string) {
    // Check if user is member of the room
    const roomMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId: input.roomId,
        },
      },
    });

    if (!roomMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return this.prisma.message.create({
      data: {
        ...input,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getRoomMessages(roomId: string, userId: string, limit = 50, offset = 0) {
    // Check if user is member of the room
    const roomMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (!roomMember) {
      throw new ForbiddenException('You are not a member of this room');
    }

    return this.prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            isOnline: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.delete({
      where: { id: messageId },
    });

    return true;
  }
}