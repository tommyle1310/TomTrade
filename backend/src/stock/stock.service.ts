import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async getStock(ticker: string) {
    return this.prisma.stock.findUnique({
      where: { ticker },
    });
  }

  async getAllStocks() {
    return this.prisma.stock.findMany();
  }

  async news(ticker: string, limit: number) {
    return this.prisma.news.findMany({
      where: { ticker },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  async forecastModels(ticker: string) {
    return this.prisma.forecastModel.findMany({
      where: { ticker },
      orderBy: { trainedAt: 'desc' },
    });
  }

  async dividends(ticker: string, limit: number) {
    return this.prisma.dividend.findMany({
      where: { ticker },
      orderBy: { exDate: 'desc' },
      take: limit,
    });
  }
}
