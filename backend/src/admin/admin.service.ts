import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async banUser(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot ban admin users');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });
  }

  async unbanUser(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });
  }

  async promoteToAdmin(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.ADMIN },
    });
  }

  async demoteFromAdmin(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: Role.USER },
    });
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
