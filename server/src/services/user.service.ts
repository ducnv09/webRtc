import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateOnlineStatus(userId: string, isOnline: boolean) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });
    return true;
  }

  async updateProfile(userId: string, data: { username?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}