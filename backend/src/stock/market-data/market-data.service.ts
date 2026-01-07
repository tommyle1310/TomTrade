import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { MarketOverviewPaginationInput } from "../dto/market-overview.input";
import { MarketOverviewPaginationResponse } from "../entities/market-overview.entity";
import { TopMoversPaginationInput } from "../dto/top-movers.input";
import { TopMoversPaginationResponse } from "../entities/top-mover.entity";

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

  async getMarketOverview(
    input: MarketOverviewPaginationInput,
  ): Promise<MarketOverviewPaginationResponse> {
    const { page, limit } = input;

    // Define market indices (mock data - replace with real data source)
    const allIndices = [
      {
        key: 'sp500',
        label: 'S&P 500',
        value: 1.2,
        unit: '%',
        trend: 'up' as const,
      },
      {
        key: 'nasdaq',
        label: 'NASDAQ',
        value: -0.8,
        unit: '%',
        trend: 'down' as const,
      },
      {
        key: 'dow',
        label: 'DOW',
        value: 0.5,
        unit: '%',
        trend: 'up' as const,
      },
      {
        key: 'vix',
        label: 'VIX',
        value: 18.5,
        unit: '',
        trend: 'neutral' as const,
      },
      {
        key: 'us10y',
        label: '10Y Treasury',
        value: 4.2,
        unit: '%',
        trend: 'up' as const,
      },
      {
        key: 'dxy',
        label: 'USD Index',
        value: 0.3,
        unit: '%',
        trend: 'up' as const,
      },
    ];

    const total = allIndices.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allIndices.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  async getTopMovers(
    input: TopMoversPaginationInput,
  ): Promise<TopMoversPaginationResponse> {
    const { page, limit, filter = 'gainers' } = input;
    const skip = (page - 1) * limit;

    // Get all stocks with at least 2 market data points
    const stocks = await this.prisma.stock.findMany({
      where: {
        isTradable: true,
      },
      select: {
        ticker: true,
        avatar: true,
      },
    });

    // Calculate percentage change for each stock
    const moversWithChange = await Promise.all(
      stocks.map(async (stock) => {
        const marketData = await this.prisma.marketData.findMany({
          where: { ticker: stock.ticker },
          orderBy: { timestamp: 'desc' },
          take: 2,
        });

        if (marketData.length < 2) {
          return null;
        }

        const [latest, previous] = marketData;
        const percentageChange =
          ((latest.close - previous.close) / previous.close) * 100;

        return {
          symbol: stock.ticker,
          avatar: stock.avatar,
          value: percentageChange,
        };
      }),
    );

    // Filter out nulls and sort
    const validMovers = moversWithChange.filter(
      (m): m is { symbol: string; avatar: string | null; value: number } =>
        m !== null,
    );

    // Sort based on filter
    const sortedMovers = validMovers.sort((a, b) => {
      if (filter === 'losers') {
        return a.value - b.value; // Ascending (most negative first)
      }
      return b.value - a.value; // Descending (most positive first)
    });

    const total = sortedMovers.length;
    const data = sortedMovers.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }
}
