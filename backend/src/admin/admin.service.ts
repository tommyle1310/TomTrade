import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';
import { AdminUser } from './entities/admin-user.entity';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<AdminUser[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
        balance: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      ...user,
      balance: user.balance?.amount || 0,
    }));
  }

  async getUserById(userId: string): Promise<AdminUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
        balance: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      balance: user.balance?.amount || 0,
    };
  }

  async banUser(userId: string): Promise<AdminUser> {
    const user = await this.getUserById(userId);

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot ban admin users');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
        balance: {
          select: {
            amount: true,
          },
        },
      },
    });

    return {
      ...updatedUser,
      balance: updatedUser.balance?.amount || 0,
    };
  }

  async unbanUser(userId: string): Promise<AdminUser> {
    const user = await this.getUserById(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
        balance: {
          select: {
            amount: true,
          },
        },
      },
    });

    return {
      ...updatedUser,
      balance: updatedUser.balance?.amount || 0,
    };
  }

  async promoteToAdmin(userId: string): Promise<AdminUser> {
    const user = await this.getUserById(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.ADMIN },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
        balance: {
          select: {
            amount: true,
          },
        },
      },
    });

    return {
      ...updatedUser,
      balance: updatedUser.balance?.amount || 0,
    };
  }

  async demoteFromAdmin(userId: string): Promise<AdminUser> {
    const user = await this.getUserById(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.USER },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        avatar: true,
        createdAt: true,
        balance: {
          select: {
            amount: true,
          },
        },
      },
    });

    return {
      ...updatedUser,
      balance: updatedUser.balance?.amount || 0,
    };
  }

  async getUserPortfolio(userId: string) {
    const user = await this.getUserById(userId);

    const portfolio = await this.prisma.portfolio.findMany({
      where: { userId },
      include: {
        stock: true,
      },
    });

    const balance = await this.prisma.balance.findUnique({
      where: { userId },
    });

    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      user,
      portfolio,
      balance: balance?.amount || 0,
      transactions,
      orders,
    };
  }

  async getSystemStats() {
    const totalUsers = await this.prisma.user.count();
    const totalOrders = await this.prisma.order.count();
    const totalTransactions = await this.prisma.transaction.count();
    const totalStocks = await this.prisma.stock.count();

    const bannedUsers = await this.prisma.user.count({
      where: { isBanned: true },
    });

    const adminUsers = await this.prisma.user.count({
      where: { role: Role.ADMIN },
    });

    return {
      totalUsers,
      totalOrders,
      totalTransactions,
      totalStocks,
      bannedUsers,
      adminUsers,
    };
  }

  async getRecentActivity(limit: number = 100) {
    const transactions = await this.prisma.transaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, email: true },
        },
        stock: {
          select: { ticker: true, companyName: true },
        },
      },
    });

    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, email: true },
        },
        stock: {
          select: { ticker: true, companyName: true },
        },
      },
    });

    return {
      transactions,
      orders,
    };
  }
}
