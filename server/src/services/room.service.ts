import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateRoomInput, UpdateRoomInput } from '../graphql/inputs/room.input';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateRoomInput, creatorId: string) {
    const room = await this.prisma.room.create({
      data: {
        ...input,
        creatorId,
      },
      include: {
        creator: {
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
        members: {
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
        },
        messages: {
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
          take: 50,
        },
      },
    });

    // Auto-join creator to room
    await this.joinRoom(room.id, creatorId);

    return room;
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        creator: {
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
        members: {
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
        },
        messages: {
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
          take: 50,
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async findAll() {
    return this.prisma.room.findMany({
      where: { isActive: true },
      include: {
        creator: {
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
        members: {
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
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async joinRoom(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (!room.isActive) {
      throw new BadRequestException('Room is not active');
    }

    if (room.members.length >= room.maxMembers) {
      throw new BadRequestException('Room is full');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (existingMember) {
      return true; // Already a member
    }

    await this.prisma.roomMember.create({
      data: {
        userId,
        roomId,
      },
    });

    return true;
  }

  async leaveRoom(roomId: string, userId: string) {
    await this.prisma.roomMember.delete({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    // Check if this was the last member
    const remainingMembers = await this.prisma.roomMember.count({
      where: { roomId },
    });

    // If no members left, deactivate the room (auto-delete)
    if (remainingMembers === 0) {
      await this.prisma.room.update({
        where: { id: roomId },
        data: { isActive: false },
      });

      // Publish room deletion event
      pubSub.publish('roomDeleted', { roomDeleted: { id: roomId } });
    }

    return true;
  }

  async updateRoom(roomId: string, userId: string, input: UpdateRoomInput) {
    const room = await this.findById(roomId);

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only room creator can update the room');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: input,
      include: {
        creator: {
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
        members: {
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
        },
      },
    });
  }

  async deleteRoom(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only room creator can delete the room');
    }

    await this.prisma.room.update({
      where: { id: roomId },
      data: { isActive: false },
    });

    return true;
  }

  async getRoomMembers(roomId: string) {
    const members = await this.prisma.roomMember.findMany({
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
      orderBy: { joinedAt: 'asc' },
    });

    return members.map(member => member.user);
  }
}