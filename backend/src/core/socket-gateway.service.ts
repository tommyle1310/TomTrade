import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private server: Server;
  private sentIds = new Set<string>();

  setServer(server: Server) {
    if (!this.server) {
      this.server = server;
    }
  }

  sendAlert(alert: { userId: string; data: any }) {
    if (!this.server) {
      console.error('Socket server not initialized!');
      return;
    }

    const id = alert.data.alert?.id;
    if (this.sentIds.has(id)) return;
    this.sentIds.add(id);

    this.server.to(alert.userId).emit('priceAlert', alert.data);
    console.log(`✅ Alert sent to user ${alert.userId}`);
  }

  sendOrderNotification(
    userId: string,
    notification: {
      type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED';
      orderId: string;
      ticker: string;
      side: 'BUY' | 'SELL';
      quantity: number;
      price: number;
      message: string;
    },
  ) {
    if (!this.server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `🔔 Attempting to send order notification to user ${userId}:`,
      notification,
    );
    this.server.to(userId).emit('orderNotification', notification);
    console.log(
      `✅ Order notification sent to user ${userId}: ${notification.type}`,
    );
  }

  sendPortfolioUpdate(
    userId: string,
    portfolioData: {
      totalValue: number;
      totalPnL: number;
      positions: Array<{
        ticker: string;
        quantity: number;
        averagePrice: number;
        currentPrice: number;
        marketValue: number;
        unrealizedPnL: number;
        pnlPercentage: number;
      }>;
    },
  ) {
    if (!this.server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `📊 Attempting to send portfolio update to user ${userId}:`,
      portfolioData,
    );
    this.server.to(userId).emit('portfolioUpdate', portfolioData);
    console.log(`✅ Portfolio update sent to user ${userId}`);
  }

  sendBalanceUpdate(
    userId: string,
    balanceData: {
      balance: number;
      totalAssets: number;
    },
  ) {
    if (!this.server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `💰 Attempting to send balance update to user ${userId}:`,
      balanceData,
    );
    this.server.to(userId).emit('balanceUpdate', balanceData);
    console.log(`✅ Balance update sent to user ${userId}`);
  }
}
