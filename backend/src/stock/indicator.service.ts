import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class IndicatorService {
  constructor(private prisma: PrismaService) {}

  async getSMA(
    ticker: string,
    period: number,
    interval: string = '1d',
  ): Promise<number[]> {
    const marketData = await this.prisma.marketData.findMany({
      where: { ticker, interval },
      orderBy: { timestamp: 'desc' },
      take: period * 2, // Get extra data for safety
    });

    if (marketData.length < period) {
      throw new Error(
        `Insufficient data for SMA calculation. Need ${period} periods, got ${marketData.length}`,
      );
    }

    const smaValues: number[] = [];
    const prices = marketData.map((d) => d.close).reverse(); // Reverse to get chronological order

    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices
        .slice(i - period + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      const sma = sum / period;
      smaValues.push(sma);
    }

    return smaValues;
  }

  async getEMA(
    ticker: string,
    period: number,
    interval: string = '1d',
  ): Promise<number[]> {
    const marketData = await this.prisma.marketData.findMany({
      where: { ticker, interval },
      orderBy: { timestamp: 'desc' },
      take: period * 3, // Get extra data for safety
    });

    if (marketData.length < period) {
      throw new Error(
        `Insufficient data for EMA calculation. Need ${period} periods, got ${marketData.length}`,
      );
    }

    const prices = marketData.map((d) => d.close).reverse(); // Reverse to get chronological order
    const emaValues: number[] = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA as the first EMA value
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    emaValues.push(ema);

    // Calculate EMA for remaining periods
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
      emaValues.push(ema);
    }

    return emaValues;
  }

  async getRSI(
    ticker: string,
    period: number = 14,
    interval: string = '1d',
  ): Promise<number[]> {
    const marketData = await this.prisma.marketData.findMany({
      where: { ticker, interval },
      orderBy: { timestamp: 'desc' },
      take: period * 3, // Get extra data for safety
    });

    if (marketData.length < period + 1) {
      throw new Error(
        `Insufficient data for RSI calculation. Need ${period + 1} periods, got ${marketData.length}`,
      );
    }

    const prices = marketData.map((d) => d.close).reverse(); // Reverse to get chronological order
    const rsiValues: number[] = [];

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    // Calculate initial average gain and loss
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        avgGain += changes[i];
      } else {
        avgLoss += Math.abs(changes[i]);
      }
    }

    avgGain /= period;
    avgLoss /= period;

    // Calculate RSI for the first period
    let rs = avgGain / avgLoss;
    let rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);

    // Calculate RSI for remaining periods
    for (let i = period; i < changes.length; i++) {
      let currentGain = 0;
      let currentLoss = 0;

      if (changes[i] > 0) {
        currentGain = changes[i];
      } else {
        currentLoss = Math.abs(changes[i]);
      }

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

      rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
      rsiValues.push(rsi);
    }

    return rsiValues;
  }

  async getBollingerBands(
    ticker: string,
    period: number = 20,
    stdDev: number = 2,
    interval: string = '1d',
  ): Promise<{
    upper: number[];
    middle: number[];
    lower: number[];
  }> {
    const smaValues = await this.getSMA(ticker, period, interval);
    const marketData = await this.prisma.marketData.findMany({
      where: { ticker, interval },
      orderBy: { timestamp: 'desc' },
      take: period * 2,
    });

    const prices = marketData.map((d) => d.close).reverse();
    const bands = {
      upper: [] as number[],
      middle: [] as number[],
      lower: [] as number[],
    };

    for (let i = period - 1; i < prices.length; i++) {
      const sma = smaValues[i - period + 1];
      const slice = prices.slice(i - period + 1, i + 1);

      // Calculate standard deviation
      const variance =
        slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) /
        period;
      const standardDeviation = Math.sqrt(variance);

      bands.middle.push(sma);
      bands.upper.push(sma + standardDeviation * stdDev);
      bands.lower.push(sma - standardDeviation * stdDev);
    }

    return bands;
  }

  async getMACD(
    ticker: string,
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
    interval: string = '1d',
  ): Promise<{
    macd: number[];
    signal: number[];
    histogram: number[];
  }> {
    const fastEMA = await this.getEMA(ticker, fastPeriod, interval);
    const slowEMA = await this.getEMA(ticker, slowPeriod, interval);

    const macdLine: number[] = [];
    const minLength = Math.min(fastEMA.length, slowEMA.length);

    for (let i = 0; i < minLength; i++) {
      const fastIndex = fastEMA.length - minLength + i;
      const slowIndex = slowEMA.length - minLength + i;
      macdLine.push(fastEMA[fastIndex] - slowEMA[slowIndex]);
    }

    // Calculate signal line (EMA of MACD)
    const signalLine: number[] = [];
    const multiplier = 2 / (signalPeriod + 1);

    if (macdLine.length >= signalPeriod) {
      let signal =
        macdLine.slice(0, signalPeriod).reduce((a, b) => a + b, 0) /
        signalPeriod;
      signalLine.push(signal);

      for (let i = signalPeriod; i < macdLine.length; i++) {
        signal = macdLine[i] * multiplier + signal * (1 - multiplier);
        signalLine.push(signal);
      }
    }

    // Calculate histogram
    const histogram: number[] = [];
    const minSignalLength = Math.min(macdLine.length, signalLine.length);

    for (let i = 0; i < minSignalLength; i++) {
      histogram.push(
        macdLine[macdLine.length - minSignalLength + i] - signalLine[i],
      );
    }

    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram,
    };
  }
}
