import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string) {
    return this.prisma.watchlist.create({
      data: { userId, name },
    });
  }

  async getAll(userId: string) {
    const lists = await this.prisma.watchlist.findMany({
      where: { userId },
      include: {
        items: {
          include: { stock: true },
        },
      },
    });

    return lists.map((list) => ({
      ...list,
      stocks: list.items.map((item) => item.stock),
    }));
  }

  async addStock(watchlistId: string, ticker: string) {
    return this.prisma.watchlistItem.create({
      data: {
        watchlistId,
        ticker,
      },
    });
  }

  async removeStock(watchlistId: string, ticker: string) {
    return this.prisma.watchlistItem.deleteMany({
      where: {
        watchlistId,
        ticker,
      },
    });
  }
}
