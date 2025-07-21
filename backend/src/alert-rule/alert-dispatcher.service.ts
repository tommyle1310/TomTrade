import { Injectable } from "@nestjs/common";
import { AlertRuleService } from "./alert-rule.service";
import { StockGateway } from "src/common/gateway/stock/stock.gateway";
import { SocketService } from "src/core/socket-gateway.service";

@Injectable()
export class AlertDispatcherService {
  constructor(
    private readonly alertRuleService: AlertRuleService,
    private readonly socketService: SocketService,
  ) {}

  async handleStockPriceUpdate(ticker: string, price: number) {
    const alerts = await this.alertRuleService.checkAndTrigger(ticker, price);

    for (const alert of alerts) {
        await this.socketService.sendAlert({ userId: alert.userId, data: alert.data });

    }
  }
}
