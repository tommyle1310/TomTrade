import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

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
}
