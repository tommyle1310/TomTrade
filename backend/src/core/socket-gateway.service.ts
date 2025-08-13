import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private _server: Server;
  private sentIds = new Set<string>();

  get server(): Server | undefined {
    return this._server;
  }

  setServer(server: Server) {
    console.log(
      '🔧 SocketService.setServer called with server:',
      server ? 'valid server instance' : 'null/undefined',
    );

    if (!this._server) {
      this._server = server;
      console.log('✅ SocketService._server set successfully');
    } else {
      console.log('⚠️ SocketService._server already set, skipping');
    }
  }

  // Helper method to send to userId room (which clients are actually joining)
  private sendToUser(userId: string, event: string, data: any) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    // Try to send directly without accessing sockets.adapter.rooms
    try {
      // Send to userId room (which clients are actually joining)
      this._server.to(userId).emit(event, data);
      console.log(`✅ ${event} sent to user ${userId}`);
    } catch (error) {
      console.error(
        `❌ Error sending ${event} to user ${userId}:`,
        error.message,
      );
    }
  }

  // Helper method to send to both userId and userEmail rooms for maximum compatibility
  private sendToUserWithEmail(
    userId: string,
    userEmail: string,
    event: string,
    data: any,
  ) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    // Send to both userId and userEmail rooms for maximum compatibility
    try {
      this._server.to(userId).emit(event, data);
      this._server.to(userEmail).emit(event, data);
      console.log(`✅ ${event} sent to user ${userEmail} (${userId})`);
    } catch (error) {
      console.error(
        `❌ Error sending ${event} to user ${userEmail} (${userId}):`,
        error.message,
      );
    }
  }

  sendAlert(alert: {
    userId: string;
    data: {
      message: string;
      alert: any;
    };
  }) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `🚨 Attempting to send price alert to user ${alert.userId}:`,
      alert.data,
    );

    this.sendToUser(alert.userId, 'priceAlert', alert.data);

    console.log(`✅ Price alert sent to user ${alert.userId}`);
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
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `🔔 Attempting to send order notification to user ${userId}:`,
      notification,
    );

    this.sendToUser(userId, 'orderNotification', notification);

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
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `📊 Attempting to send portfolio update to user ${userId}:`,
      portfolioData,
    );

    this.sendToUser(userId, 'portfolioUpdate', portfolioData);

    console.log(`✅ Portfolio update sent to user ${userId}`);
  }

  sendBalanceUpdate(
    userId: string,
    balanceData: {
      balance: number;
      totalAssets: number;
    },
  ) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `💰 Attempting to send balance update to user ${userId}:`,
      balanceData,
    );

    this.sendToUser(userId, 'balanceUpdate', balanceData);

    console.log(`✅ Balance update sent to user ${userId}`);
  }

  broadcastMarketDataUpdate(marketData: {
    ticker: string;
    price: number;
    volume: number;
    timestamp: string;
  }) {
    if (!this._server) {
      console.error('Socket server not initialized!');
      return;
    }

    console.log(
      `📊 Broadcasting market data update: ${marketData.ticker} at $${marketData.price}`,
    );
    this._server.emit('marketDataUpdate', marketData);
    console.log(`✅ Market data update broadcasted to all clients`);
  }
}
