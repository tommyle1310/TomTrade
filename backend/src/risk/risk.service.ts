import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

export interface RiskConfig {
  maxPositionSizePercent: number; // Max % of portfolio per position
  maxRiskPerTrade: number; // Max % risk per trade
  maxPortfolioRisk: number; // Max % risk for entire portfolio
  stopLossPercent: number; // Default stop loss %
  maxLeverage: number; // Maximum leverage allowed
}

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  private defaultRiskConfig: RiskConfig = {
    maxPositionSizePercent: 10, // 10% max per position
    maxRiskPerTrade: 2, // 2% risk per trade
    maxPortfolioRisk: 20, // 20% max portfolio risk
    stopLossPercent: 5, // 5% default stop loss
    maxLeverage: 1, // No leverage by default
  };

  async getRiskConfig(userId: string): Promise<RiskConfig> {
    // In the future, this could be stored per user
    // For now, return default config
    return this.defaultRiskConfig;
  }

  async validatePositionSize(
    userId: string,
    ticker: string,
    quantity: number,
    price: number,
  ): Promise<{ isValid: boolean; message?: string; maxQuantity?: number }> {
    const riskConfig = await this.getRiskConfig(userId);

    // Get user's portfolio value
    const portfolioValue = await this.calculatePortfolioValue(userId);

    // Calculate position value
    const positionValue = quantity * price;

    // Check max position size
    const maxPositionValue =
      portfolioValue * (riskConfig.maxPositionSizePercent / 100);

    if (positionValue > maxPositionValue) {
      const maxQuantity = Math.floor(maxPositionValue / price);
      return {
        isValid: false,
        message: `Position size exceeds maximum allowed. Max position value: $${maxPositionValue.toFixed(2)}`,
        maxQuantity,
      };
    }

    return { isValid: true };
  }

  async validateRiskPerTrade(
    userId: string,
    ticker: string,
    quantity: number,
    price: number,
    stopLossPrice?: number,
  ): Promise<{ isValid: boolean; message?: string }> {
    const riskConfig = await this.getRiskConfig(userId);
    const portfolioValue = await this.calculatePortfolioValue(userId);

    // Calculate potential loss
    const stopLoss =
      stopLossPrice || price * (1 - riskConfig.stopLossPercent / 100);
    const potentialLoss = quantity * (price - stopLoss);
    const riskPercent = (potentialLoss / portfolioValue) * 100;

    if (riskPercent > riskConfig.maxRiskPerTrade) {
      return {
        isValid: false,
        message: `Trade risk (${riskPercent.toFixed(2)}%) exceeds maximum allowed (${riskConfig.maxRiskPerTrade}%)`,
      };
    }

    return { isValid: true };
  }

  async validatePortfolioRisk(
    userId: string,
  ): Promise<{ isValid: boolean; message?: string; currentRisk: number }> {
    const riskConfig = await this.getRiskConfig(userId);

    // Calculate current portfolio risk
    const portfolioRisk = await this.calculatePortfolioRisk(userId);

    if (portfolioRisk > riskConfig.maxPortfolioRisk) {
      return {
        isValid: false,
        message: `Portfolio risk (${portfolioRisk.toFixed(2)}%) exceeds maximum allowed (${riskConfig.maxPortfolioRisk}%)`,
        currentRisk: portfolioRisk,
      };
    }

    return { isValid: true, currentRisk: portfolioRisk };
  }

  async calculateMaxPositionSize(
    userId: string,
    ticker: string,
    price: number,
  ): Promise<{ maxQuantity: number; maxValue: number }> {
    const riskConfig = await this.getRiskConfig(userId);
    const portfolioValue = await this.calculatePortfolioValue(userId);

    const maxPositionValue =
      portfolioValue * (riskConfig.maxPositionSizePercent / 100);
    const maxQuantity = Math.floor(maxPositionValue / price);

    return {
      maxQuantity,
      maxValue: maxPositionValue,
    };
  }

  async calculateRecommendedStopLoss(
    userId: string,
    ticker: string,
    entryPrice: number,
    side: 'BUY' | 'SELL',
  ): Promise<number> {
    const riskConfig = await this.getRiskConfig(userId);
    const portfolioValue = await this.calculatePortfolioValue(userId);

    // Calculate stop loss based on max risk per trade
    const maxRiskAmount = portfolioValue * (riskConfig.maxRiskPerTrade / 100);

    if (side === 'BUY') {
      return entryPrice * (1 - riskConfig.stopLossPercent / 100);
    } else {
      return entryPrice * (1 + riskConfig.stopLossPercent / 100);
    }
  }

  private async calculatePortfolioValue(userId: string): Promise<number> {
    const portfolio = await this.prisma.portfolio.findMany({
      where: { userId },
      include: {
        stock: true,
      },
    });

    let totalValue = 0;

    for (const position of portfolio) {
      // Get current price
      const latestMarketData = await this.prisma.marketData.findFirst({
        where: { ticker: position.ticker },
        orderBy: { timestamp: 'desc' },
      });

      const currentPrice = latestMarketData?.close || position.averagePrice;
      totalValue += position.quantity * currentPrice;
    }

    // Add cash balance
    const balance = await this.prisma.balance.findUnique({
      where: { userId },
    });

    totalValue += balance?.amount || 0;

    return totalValue;
  }

  private async calculatePortfolioRisk(userId: string): Promise<number> {
    const portfolio = await this.prisma.portfolio.findMany({
      where: { userId },
    });

    const portfolioValue = await this.calculatePortfolioValue(userId);
    let totalRisk = 0;

    for (const position of portfolio) {
      // Get current price
      const latestMarketData = await this.prisma.marketData.findFirst({
        where: { ticker: position.ticker },
        orderBy: { timestamp: 'desc' },
      });

      const currentPrice = latestMarketData?.close || position.averagePrice;
      const positionValue = position.quantity * currentPrice;

      // Calculate risk based on volatility (simplified)
      // In a real implementation, you'd calculate actual volatility
      const riskPercent = 5; // Assume 5% risk per position
      const positionRisk = positionValue * (riskPercent / 100);

      totalRisk += positionRisk;
    }

    return (totalRisk / portfolioValue) * 100;
  }

  async getRiskReport(userId: string): Promise<{
    portfolioValue: number;
    portfolioRisk: number;
    maxPositionSize: number;
    riskConfig: RiskConfig;
  }> {
    const portfolioValue = await this.calculatePortfolioValue(userId);
    const portfolioRisk = await this.calculatePortfolioRisk(userId);
    const riskConfig = await this.getRiskConfig(userId);

    return {
      portfolioValue,
      portfolioRisk,
      maxPositionSize:
        portfolioValue * (riskConfig.maxPositionSizePercent / 100),
      riskConfig,
    };
  }
}
