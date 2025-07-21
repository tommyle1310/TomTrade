import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class MarketDataService {
  constructor(private readonly prisma: PrismaService) {}

  async getByTicker(ticker: string, interval: string) {
    return this.prisma.marketData.findMany({
      where: { ticker, interval },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }
}
