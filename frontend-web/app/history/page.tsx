"use client";

import { gql, useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GET_TRADES = gql`
  query GetTrades($symbol: String!, $limit: Int) {
    trades(symbol: $symbol, limit: $limit) {
      tradeId
      price
      quantity
      side
      timestamp
    }
  }
`;

export default function TradeHistoryPage() {
  const { data } = useQuery(GET_TRADES, { variables: { symbol: "AAPL", limit: 100 } });
  const list = data?.trades || [];

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {list.map((t: any) => (
              <div key={t.tradeId} className="flex items-center justify-between rounded border px-3 py-2">
                <div className="flex items-center gap-3">
                  <Badge variant={t.side === 'BUY' ? 'default' : 'secondary'}>{t.side}</Badge>
                  <div className="text-sm text-muted-foreground">{new Date(t.timestamp).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm">Qty: {t.quantity}</div>
                  <div className="font-medium">${t.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


