import { Injectable } from '@nestjs/common';
import { AlertRuleService } from './alert-rule.service';
import { StockGateway } from 'src/common/gateway/stock/stock.gateway';
import { SocketService } from 'src/core/socket-gateway.service';

@Injectable()
export class AlertDispatcherService {
  constructor(
    private readonly alertRuleService: AlertRuleService,
    private readonly socketService: SocketService,
  ) {}

  async handleStockPriceUpdate(ticker: string, price: number) {
    console.log(`🔔 Alert dispatcher called for ${ticker} at price ${price}`);
    const alerts = await this.alertRuleService.checkAndTrigger(ticker, price);
    console.log(`📊 Found ${alerts.length} alerts to send for ${ticker}`);

    for (const alert of alerts) {
      console.log(`📤 Sending alert to user ${alert.userId}: ${alert.data.message}`);
      await this.socketService.sendAlert({
        userId: alert.userId,
        data: alert.data,
      });
    }
  }
}
