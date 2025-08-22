"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Trade {
  tradeId: number;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

const GET_CANDLES = gql`
  query GetCandles($symbol: String!, $interval: String!, $limit: Int) {
    candles(symbol: $symbol, interval: $interval, limit: $limit) {
      timestamp
      open
      high
      low
      close
      volume
    }
  }
`;

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

const GET_STOCKS = gql`
  query GetStocks($input: StockPaginationInput!) {
    adminStocks(input: $input) {
      stocks {
        ticker
        companyName
        exchange
        isTradable
      }
      meta { totalCount }
    }
  }
`;

// Enhanced candlestick chart with proper scaling and responsive design
const CandlestickChart = ({ data, interval }: { data: Candle[]; interval: string }) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Process and normalize data
  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Sort by timestamp and remove duplicates
    const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
    const unique = sorted.filter((candle, index) => 
      index === 0 || candle.timestamp !== sorted[index - 1].timestamp
    );

    // Normalize timestamps to interval boundaries
    const normalizeTimestamp = (timestamp: number, interval: string) => {
      const date = new Date(timestamp);
      switch (interval) {
        case '1h':
          date.setMinutes(0, 0, 0);
          break;
        case '5m':
          date.setMinutes(Math.floor(date.getMinutes() / 5) * 5, 0, 0);
          break;
        case '15m':
          date.setMinutes(Math.floor(date.getMinutes() / 15) * 15, 0, 0);
          break;
        case '30m':
          date.setMinutes(Math.floor(date.getMinutes() / 30) * 30, 0, 0);
          break;
        case '1m':
          date.setSeconds(0, 0);
          break;
        default:
          break;
      }
      return date.getTime();
    };

    return unique.map(candle => ({
      ...candle,
      normalizedTimestamp: normalizeTimestamp(candle.timestamp, interval),
      isGreen: candle.close >= candle.open,
    }));
  }, [data, interval]);

  // Calculate scales
  const scales = useMemo(() => {
    if (!processedData.length) return null;

    const minPrice = Math.min(...processedData.map(d => d.low));
    const maxPrice = Math.max(...processedData.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.05; // 5% padding

    return {
      minPrice: minPrice - padding,
      maxPrice: maxPrice + padding,
      priceRange: priceRange + padding * 2,
      candleCount: processedData.length,
    };
  }, [processedData]);

  const handleMouseMove = (event: React.MouseEvent, candle: Candle) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    setHoveredCandle(candle);
  };

  if (!scales || !processedData.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const { minPrice, maxPrice, priceRange, candleCount } = scales;
  const containerWidth = containerRef.current?.clientWidth || 800;
  const minCandleWidth = 4; // Minimum 4px per candle
  const maxCandleWidth = 20; // Maximum 20px per candle
  const availableWidth = containerWidth - 80; // Account for Y-axis labels
  const candleWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, availableWidth / candleCount));
  const chartWidth = candleCount * candleWidth;

  return (
    <div ref={containerRef} className="relative h-[400px] w-full overflow-hidden">
      {/* Y-axis price labels */}
      <div className="absolute left-0 top-0 w-16 h-full flex flex-col justify-between text-xs text-muted-foreground z-10">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <div key={i} className="text-right text-indigo-400 font-bold pr-2 bg-background">
            ${(maxPrice - priceRange * ratio).toFixed(2)}
          </div>
        ))}
      </div>

      {/* Chart container with proper scrolling */}
      <div className="ml-16 h-full overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ width: `${chartWidth}px`, minWidth: '100%', height: '100%' }}>
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} 400`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            
            {processedData.map((candle, i) => {
              const x = i * candleWidth + candleWidth / 2;
              const isGreen = candle.isGreen;
              
              // Calculate Y positions (inverted for SVG)
              const highY = 400 - ((candle.high - minPrice) / priceRange) * 360;
              const lowY = 400 - ((candle.low - minPrice) / priceRange) * 360;
              const openY = 400 - ((candle.open - minPrice) / priceRange) * 360;
              const closeY = 400 - ((candle.close - minPrice) / priceRange) * 360;
              
              const bodyHeight = Math.abs(closeY - openY);
              const bodyY = Math.min(openY, closeY);
              const bodyWidth = Math.max(2, candleWidth * 0.8);
              
              const isHovered = hoveredCandle === candle;
              const strokeWidth = isHovered ? 2 : 1;
              const opacity = isHovered ? 1 : 0.8;
              
              return (
                <g 
                  key={i}
                  onMouseEnter={(e) => handleMouseMove(e, candle)}
                  onMouseLeave={() => setHoveredCandle(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isGreen ? "#10b981" : "#ef4444"}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />
                  {/* Body */}
                  <rect
                    x={x - bodyWidth / 2}
                    y={bodyY}
                    width={bodyWidth}
                    height={Math.max(bodyHeight, 2)}
                    fill={isGreen ? "url(#greenGradient)" : "url(#redGradient)"}
                    stroke={isGreen ? "#059669" : "#dc2626"}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Hover tooltip - positioned ABOVE the cursor */}
      {hoveredCandle && (
        <div 
          className="absolute bg-background border rounded-lg p-3 shadow-lg z-20 pointer-events-none"
          style={{
            left: Math.min(tooltipPosition.x + 10, containerWidth - 200),
            top: Math.max(tooltipPosition.y - 120, 10), // Position ABOVE cursor
          }}
        >
          <div className="text-sm font-medium text-muted-foreground">
            {new Date(hoveredCandle.timestamp).toLocaleString()}
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Open:</span>
              <span className="font-mono">${hoveredCandle.open.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">High:</span>
              <span className="font-mono text-green-600">${hoveredCandle.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-mono text-red-600">${hoveredCandle.low.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Close:</span>
              <span className="font-mono">${hoveredCandle.close.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-mono">{hoveredCandle.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced volume chart with proper alignment and scaling
const VolumeChart = ({ data, candleWidth }: { data: Candle[]; candleWidth: number }) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Process data to match candlestick chart
  const processedData = useMemo(() => {
    if (!data.length) return [];

    // Sort by timestamp and remove duplicates (same logic as candlestick chart)
    const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp);
    const unique = sorted.filter((candle, index) => 
      index === 0 || candle.timestamp !== sorted[index - 1].timestamp
    );

    return unique.map(candle => ({
      ...candle,
      isGreen: candle.close >= candle.open,
    }));
  }, [data]);

  const handleMouseMove = (event: React.MouseEvent, candle: Candle) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    setHoveredCandle(candle);
  };

  if (!processedData.length) {
    return (
      <div className="h-[150px] flex items-center justify-center text-muted-foreground">
        No volume data
      </div>
    );
  }

  const maxVolume = Math.max(...processedData.map(d => d.volume));
  const chartWidth = processedData.length * candleWidth;

  return (
    <div ref={containerRef} className="relative h-[150px] w-full overflow-hidden">
      {/* Y-axis volume labels */}
      <div className="absolute left-0 top-0 w-16 h-full flex flex-col justify-between text-xs text-muted-foreground z-10">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <div key={i} className="text-right pr-2 bg-background">
            {Math.round(maxVolume * ratio).toLocaleString()}
          </div>
        ))}
      </div>

      {/* Volume chart container */}
      <div className="ml-16 h-full overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ width: `${chartWidth}px`, minWidth: '100%', height: '100%' }}>
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} 150`} preserveAspectRatio="none">
            {processedData.map((candle, i) => {
              const x = i * candleWidth + candleWidth / 2;
              const barWidth = Math.max(2, candleWidth * 0.8);
              const height = maxVolume > 0 ? (candle.volume / maxVolume) * 120 : 0; // 120px max height
              
              return (
                <rect
                  key={i}
                  x={x - barWidth / 2}
                  y={150 - height}
                  width={barWidth}
                  height={height}
                  fill={candle.isGreen ? "#10b981" : "#ef4444"}
                  opacity="0.6"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handleMouseMove(e, candle)}
                  onMouseLeave={() => setHoveredCandle(null)}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Volume tooltip - positioned ABOVE the cursor */}
      {hoveredCandle && (
        <div 
          className="absolute bg-background border rounded-lg p-3 shadow-lg z-20 pointer-events-none"
          style={{
            left: Math.min(tooltipPosition.x + 10, (containerRef.current?.clientWidth || 800) - 200),
            top: Math.max(tooltipPosition.y - 80, 10), // Position ABOVE cursor
          }}
        >
          <div className="text-sm font-medium text-muted-foreground">
            {new Date(hoveredCandle.timestamp).toLocaleString()}
          </div>
          <div className="text-lg font-bold mt-1">
            Volume: {hoveredCandle.volume.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Price: ${hoveredCandle.close.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChartsPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [interval, setInterval] = useState("5m");

  // Get available stocks for dropdown
  const { data: stocksData } = useQuery(GET_STOCKS, {
    variables: { 
      input: { 
        page: 1, 
        limit: 1000, // Get all stocks
        isTradable: true // Only tradable stocks
      } 
    },
    fetchPolicy: "cache-and-network",
  });

  const { data: candleData, refetch: refetchCandles } = useQuery(GET_CANDLES, {
    variables: { symbol, interval, limit: 200 },
    fetchPolicy: "cache-and-network",
  });

  const { data: tradeData, refetch: refetchTrades } = useQuery(GET_TRADES, {
    variables: { symbol, limit: 100 },
    fetchPolicy: "cache-and-network",
  });

  const candles: Candle[] = candleData?.candles || [];
  const trades: Trade[] = tradeData?.trades || [];
  const stocks = stocksData?.adminStocks?.stocks || [];

  // Calculate optimal candle width based on data count
  const candleWidth = useMemo(() => {
    const containerWidth = 800; // Approximate container width
    const minCandleWidth = 4;
    const maxCandleWidth = 20;
    const availableWidth = containerWidth - 80;
    return Math.max(minCandleWidth, Math.min(maxCandleWidth, availableWidth / Math.max(1, candles.length)));
  }, [candles.length]);

  // Check for data quality issues
  const hasDuplicateTimestamps = candles.length > 1 && 
    candles.some((candle, index) => index > 0 && candle.timestamp === candles[index - 1].timestamp);
  
  const uniqueTimestamps = new Set(candles.map(c => c.timestamp)).size;
  const dataQuality = uniqueTimestamps / candles.length;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Candlestick Chart - {symbol}</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Symbol:</span>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Select stock" />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((stock: { ticker: string; companyName: string; exchange: string }) => (
                    <SelectItem key={stock.ticker} value={stock.ticker}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{stock.ticker}</span>
                        <span className="text-muted-foreground text-xs">({stock.exchange})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Interval:</span>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1D</SelectItem>
                  <SelectItem value="1h">1h</SelectItem>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="1m">1m</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => { 
                refetchCandles({ symbol, interval, limit: 200 }); 
                refetchTrades({ symbol, limit: 100 }); 
              }}
              className="h-8 px-4"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Quality Warning */}
          {hasDuplicateTimestamps && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="text-yellow-600">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <strong>Data Quality Issue:</strong> Multiple candles have identical timestamps. 
                  The chart has been adjusted to display all data points, but this creates overlap.
                </div>
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Data quality: {Math.round(dataQuality * 100)}% ({uniqueTimestamps} unique timestamps out of {candles.length} candles)
              </div>
              <div className="mt-2 text-xs text-yellow-700">
                💡 <strong>Solution:</strong> Clear existing data and regenerate using the updated seeder with unique timestamps.
              </div>
            </div>
          )}

          {candles.length > 0 ? (
            <div className="space-y-4">
              {/* Price Chart */}
              <div className="mb-2">
                <CandlestickChart data={candles} interval={interval} />
              </div>
              
              {/* Volume Chart */}
              <div className="mb-2">
                <VolumeChart data={candles} candleWidth={candleWidth} />
              </div>
              
              {/* X-axis Time Labels */}
              <div className="h-6 flex justify-between text-xs text-muted-foreground px-16">
                {(() => {
                  const unique: number[] = Array.from(new Set(candles.map((d: Candle) => d.timestamp)));
                  const tickCount = 6;
                  const step = Math.max(1, Math.floor(unique.length / tickCount));
                  const ticks = unique.filter((_, i) => i % step === 0 || i === unique.length - 1);
                  return ticks.map((t: number, i: number) => (
                    <div key={i} className="text-center">
                      {new Date(Number(t)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  ));
                })()}
              </div>
              
              {/* Data Summary */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{candles.length}</div>
                  <div className="text-sm text-muted-foreground">Total Candles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{uniqueTimestamps}</div>
                  <div className="text-sm text-muted-foreground">Unique Times</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${Math.min(...candles.map(c => c.low)).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    ${Math.max(...candles.map(c => c.high)).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">High Price</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No data available for {symbol}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {trades.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {trades.slice(-20).reverse().map((trade: Trade) => (
                <div 
                  key={trade.tradeId} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={trade.side === 'BUY' ? 'default' : 'secondary'}
                      className={trade.side === 'BUY' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                    >
                      {trade.side}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Quantity</div>
                      <div className="font-mono font-medium">{trade.quantity.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-mono font-bold text-lg">
                        ${trade.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No trades available for {symbol}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


