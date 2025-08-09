import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    // Try to get from cache first
    const cacheKey = `user:${userId}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) {
      console.log(`[UserService] User ${userId} found in cache`);
      const parsed = JSON.parse(cachedUser) as any;
      if (parsed && typeof parsed.createdAt === 'string') {
        parsed.createdAt = new Date(parsed.createdAt);
      }
      return parsed as User;
    }

    // If not in cache, get from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (user) {
      // Cache for 1 hour (3600 seconds)
      await this.redisService.setEx(cacheKey, 3600, JSON.stringify(user));
      console.log(`[UserService] User ${userId} cached for 1 hour`);
    }

    return user;
  }

  async updateUserAvatar(
    userId: string,
    avatarUrl: string,
  ): Promise<User | null> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (updatedUser) {
      // Update cache
      const cacheKey = `user:${userId}`;
      await this.redisService.setEx(
        cacheKey,
        3600,
        JSON.stringify(updatedUser),
      );
      console.log(`[UserService] User ${userId} avatar updated and cached`);
    }

    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
      },
    });
  }

  async clearUserCache(userId: string): Promise<void> {
    const cacheKey = `user:${userId}`;
    await this.redisService.del(cacheKey);
    console.log(`[UserService] Cache cleared for user ${userId}`);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new Error('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await this.clearUserCache(userId);
    return true;
  }
}
