"use client";

import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

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

// Custom candlestick chart component
const CandlestickChart = ({ data }: { data: Candle[] }) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Process data to handle duplicate timestamps with better spacing
  const processedData = data.map((candle, index) => {
    // Create unique position for each candle with better spacing
    let uniquePosition = index;
    if (index > 0 && data[index - 1].timestamp === candle.timestamp) {
      // If duplicate timestamp, create larger offset to prevent overlap
      uniquePosition = index + (index * 0.5);
    }
    
    return {
      ...candle,
      position: uniquePosition,
      isGreen: candle.close >= candle.open,
      bodyHeight: Math.abs(candle.close - candle.open),
      bodyY: Math.min(candle.open, candle.close),
      wickHeight: candle.high - candle.low,
      wickY: candle.low,
    };
  });

  const maxPrice = Math.max(...data.map(d => d.high));
  const minPrice = Math.min(...data.map(d => d.low));
  const priceRange = maxPrice - minPrice || 1;

  const handleMouseMove = (event: React.MouseEvent, candle: Candle) => {
    // Use the actual mouse position relative to the chart container
    const rect = event.currentTarget.closest('.relative')?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    setHoveredCandle(candle);
  };

  // Calculate chart width based on data points to ensure proper spacing
  const chartWidth = Math.max(100, processedData.length * 20); // Minimum 20px per candle

  return (
    <div className="relative h-[400px] w-full overflow-x-auto">
      <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
        <svg className="w-full h-full">
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
            const x = (candle.position / (processedData.length - 1)) * 100;
            const candleWidth = Math.max(8, 90 / processedData.length); // Wider candles, minimum 8%
            const isGreen = candle.isGreen;
            
            // Calculate Y positions (inverted for SVG)
            const highY = 100 - ((candle.high - minPrice) / priceRange) * 80;
            const lowY = 100 - ((candle.low - minPrice) / priceRange) * 80;
            const openY = 100 - ((candle.open - minPrice) / priceRange) * 80;
            const closeY = 100 - ((candle.close - minPrice) / priceRange) * 80;
            
            const bodyHeight = Math.abs(closeY - openY);
            const bodyY = Math.min(openY, closeY);
            
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
                  x1={`${x}%`}
                  y1={`${highY}%`}
                  x2={`${x}%`}
                  y2={`${lowY}%`}
                  stroke={isGreen ? "#10b981" : "#ef4444"}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
                {/* Body */}
                <rect
                  x={`${x - candleWidth/2}%`}
                  y={`${bodyY}%`}
                  width={`${candleWidth}%`}
                  height={`${Math.max(bodyHeight, 3)}%`}
                  fill={isGreen ? "url(#greenGradient)" : "url(#redGradient)"}
                  stroke={isGreen ? "#059669" : "#dc2626"}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Price labels */}
        <div className="absolute left-0 top-0 w-16 h-full flex flex-col justify-between text-xs text-muted-foreground">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <div key={i} className="text-right pr-2">
              ${(maxPrice - priceRange * ratio).toFixed(0)}
            </div>
          ))}
        </div>

        {/* Hover tooltip - positioned BELOW the cursor */}
        {hoveredCandle && (
          <div 
            className="absolute bg-background border rounded-lg p-3 shadow-lg z-10 pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10, // Position BELOW cursor
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
    </div>
  );
};

// Volume chart component
const VolumeChart = ({ data }: { data: Candle[] }) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const processedData = data.map((candle, index) => {
    let uniquePosition = index;
    if (index > 0 && data[index - 1].timestamp === candle.timestamp) {
      uniquePosition = index + (index * 0.5); // Same spacing as candlestick chart
    }
    
    return {
      ...candle,
      position: uniquePosition,
      isGreen: candle.close >= candle.open,
    };
  });

  const handleMouseMove = (event: React.MouseEvent, candle: Candle) => {
    // Use the actual mouse position relative to the chart container
    const rect = event.currentTarget.closest('.relative')?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    setHoveredCandle(candle);
  };

  // Calculate chart width based on data points to ensure proper spacing
  const chartWidth = Math.max(100, processedData.length * 20); // Minimum 20px per bar

  return (
    <div className="relative h-[150px] w-full overflow-x-auto">
      <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
        <svg className="w-full h-full">
          {processedData.map((candle, i) => {
            const x = (candle.position / (processedData.length - 1)) * 100;
            const candleWidth = Math.max(8, 90 / processedData.length); // Same width as candlestick
            const maxVolume = Math.max(...data.map(d => d.volume));
            const height = maxVolume > 0 ? (candle.volume / maxVolume) * 80 : 0;
            
            return (
              <rect
                key={i}
                x={`${x - candleWidth/2}%`}
                y={`${100 - height}%`}
                width={`${candleWidth}%`}
                height={`${height}%`}
                fill={candle.isGreen ? "#10b981" : "#ef4444"}
                opacity="0.6"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => handleMouseMove(e, candle)}
                onMouseLeave={() => setHoveredCandle(null)}
              />
            );
          })}
        </svg>

        {/* Volume tooltip - positioned BELOW the cursor */}
        {hoveredCandle && (
          <div 
            className="absolute bg-background border rounded-lg p-3 shadow-lg z-10 pointer-events-none"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10, // Position BELOW cursor
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
    </div>
  );
};

export default function ChartsPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [interval, setInterval] = useState("1D");

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
              <Input 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
                className="w-24 h-8 text-center font-mono"
                placeholder="AAPL"
              />
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
                  <SelectItem value="1m">1m</SelectItem>
                  <SelectItem value="5m">5m</SelectItem>
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
              {/* Synchronized Scroll Container */}
              <div className="relative">
                {/* Scrollable Chart Container */}
                <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div style={{ width: `${Math.max(100, candles.length * 40)}px`, minWidth: '100%' }}>
                    {/* Price Chart */}
                    <div className="mb-2">
                      <CandlestickChart data={candles} />
                    </div>
                    
                    {/* Volume Chart */}
                    <div className="mb-2">
                      <VolumeChart data={candles} />
                    </div>
                  </div>
                </div>
                
                {/* X-axis Time Labels - BELOW the volume chart (CORRECT position) */}
                <div className="h-6 flex justify-between text-xs text-muted-foreground px-16">
                  {(() => {
                    const step = Math.max(1, Math.floor(candles.length / 6));
                    const times = candles.filter((_, i) => i % step === 0 || i === candles.length - 1);
                    return times.map((candle, i) => (
                      <div key={i} className="text-center">
                        {new Date(candle.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    ));
                  })()}
                </div>
                
                {/* Custom Scrollbar - ONLY below volume chart */}
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ 
                      width: `${Math.min(100, (100 / Math.max(1, candles.length * 40 - 100)) * 100)}%` 
                    }}
                  ></div>
                </div>
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


