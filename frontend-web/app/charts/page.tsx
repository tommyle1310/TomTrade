"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { VolumeChart } from "./components/VolumeChart";
import { candlestick } from "@/lib/theme";

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
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

// Enhanced candlestick chart with zoom functionality
const CandlestickChart = ({
  data,
  interval,
  zoomLevel,
  onZoomChange,
  scrollPosition,
  onScrollChange
}: {
  data: Candle[];
  interval: string;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  scrollPosition: number;
  onScrollChange: (position: number) => void;
}) => {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Calculate visible data based on zoom level
  const visibleData = useMemo(() => {
    if (!processedData.length) return [];

    const totalCandles = processedData.length;
    const targetCandles = Math.max(10, Math.min(totalCandles, Math.round(totalCandles / zoomLevel)));

    // Calculate start and end indices for visible range
    const maxScroll = Math.max(0, totalCandles - targetCandles);
    const startIndex = Math.min(maxScroll, Math.max(0, Math.round(scrollPosition * maxScroll)));
    const endIndex = Math.min(totalCandles, startIndex + targetCandles);

    return processedData.slice(startIndex, endIndex);
  }, [processedData, zoomLevel, scrollPosition]);

  // Calculate scales
  const scales = useMemo(() => {
    if (!visibleData.length) return null;

    const minPrice = Math.min(...visibleData.map(d => d.low));
    const maxPrice = Math.max(...visibleData.map(d => d.high));
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.05; // 5% padding

    return {
      minPrice: minPrice - padding,
      maxPrice: maxPrice + padding,
      priceRange: priceRange + padding * 2,
      candleCount: visibleData.length,
    };
  }, [visibleData]);

  const handleCandleMouseMove = (event: React.MouseEvent, candle: Candle) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    setHoveredCandle(candle);
  };

  // Disable wheel zoom - only buttons should zoom
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    // Do nothing - zoom only via buttons
  };

  // Handle scroll
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollLeft = target.scrollLeft;
    const maxScroll = target.scrollWidth - target.clientWidth;
    const scrollRatio = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    onScrollChange(scrollRatio);
  };

  // Handle drag to scroll
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 });

  const handleMouseDown = (event: React.MouseEvent) => {
    if (scrollContainerRef.current) {
      setIsDragging(true);
      setDragStart({
        x: event.clientX,
        scrollLeft: scrollContainerRef.current.scrollLeft
      });
      event.preventDefault();
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    }
  };

  const handleDragMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const deltaX = event.clientX - dragStart.x;
    const newScrollLeft = dragStart.scrollLeft - deltaX;

    // Apply scroll to container
    scrollContainerRef.current.scrollLeft = newScrollLeft;

    // Update scroll position state for synchronization
    const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
    const scrollRatio = maxScroll > 0 ? newScrollLeft / maxScroll : 0;
    onScrollChange(scrollRatio);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Restore text selection
    document.body.style.userSelect = '';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    // Restore text selection
    document.body.style.userSelect = '';
  };

  // Apply scroll position when it changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollLeft = scrollPosition * maxScroll;
    }
  }, [scrollPosition]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== document.body) return; // Only handle when no input is focused

      const totalCandles = processedData.length;
      const targetCandles = Math.max(10, Math.min(totalCandles, Math.round(totalCandles / zoomLevel)));
      const maxScroll = Math.max(0, totalCandles - targetCandles);

      if (maxScroll === 0) return; // No scrolling needed

      let newScrollPosition = scrollPosition;

      switch (event.key) {
        case 'ArrowLeft':
          newScrollPosition = Math.max(0, scrollPosition - 0.1);
          break;
        case 'ArrowRight':
          newScrollPosition = Math.min(1, scrollPosition + 0.1);
          break;
        case 'Home':
          newScrollPosition = 0;
          break;
        case 'End':
          newScrollPosition = 1;
          break;
        default:
          return;
      }

      if (newScrollPosition !== scrollPosition) {
        event.preventDefault();
        onScrollChange(newScrollPosition);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [scrollPosition, processedData.length, zoomLevel, onScrollChange]);

  if (!scales || !visibleData.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        {/* No data available */}
      </div>
    );
  }

  const { minPrice, maxPrice, priceRange, candleCount } = scales;
  const containerWidth = containerRef.current?.clientWidth || 800;
  const minCandleWidth = 4; // Minimum 4px per candle
  const maxCandleWidth = 50; // Maximum 50px per candle when zoomed in
  const availableWidth = containerWidth - 80; // Account for Y-axis labels
  const candleWidth = Math.max(minCandleWidth, Math.min(maxCandleWidth, availableWidth / candleCount));
  const chartWidth = Math.max(availableWidth, candleCount * candleWidth);

  // Check if scrolling is needed
  const needsScrolling = chartWidth > availableWidth;

  return (
    <div ref={containerRef} className="relative h-[400px] w-full overflow-hidden" onWheel={handleWheel}>
      {/* Y-axis price labels */}
      <div className="absolute left-0 top-0 w-16 h-full flex flex-col justify-between text-xs text-muted-foreground z-10">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <div key={i} className="text-right text-indigo-400 font-bold pr-2 bg-background">
            ${(maxPrice - priceRange * ratio).toFixed(2)}
          </div>
        ))}
      </div>

      {/* Chart container with proper scrolling */}
      <div
        ref={scrollContainerRef}
        className={`ml-16 h-full transition-all duration-300 ease-in-out ${needsScrolling ? 'overflow-x-auto' : 'overflow-x-hidden'
          }`}
        style={{
          scrollbarWidth: needsScrolling ? 'auto' : 'none',
          msOverflowStyle: needsScrolling ? 'auto' : 'none',
          cursor: isDragging ? 'grabbing' : (needsScrolling ? 'grab' : 'default'),
          maxWidth: 'calc(100% - 4rem)' // Ensure it doesn't overflow parent
        }}
        onScroll={handleScroll}
        onMouseDown={needsScrolling ? handleMouseDown : undefined}
        onMouseMove={needsScrolling ? handleDragMouseMove : undefined}
        onMouseUp={needsScrolling ? handleMouseUp : undefined}
        onMouseLeave={needsScrolling ? handleMouseLeave : undefined}
      >
        <div style={{ width: `${chartWidth}px`, minWidth: '100%', height: '100%' }}>
          <svg className="w-full h-full transition-all duration-300 ease-in-out" viewBox={`0 0 ${chartWidth} 400`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={candlestick.gain.gradient.start} />
                <stop offset="100%" stopColor={candlestick.gain.gradient.end} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={candlestick.loss.gradient.start} />
                <stop offset="100%" stopColor={candlestick.loss.gradient.end} />
              </linearGradient>
            </defs>

            {visibleData.map((candle, i) => {
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
                  onMouseEnter={(e) => handleCandleMouseMove(e, candle)}
                  onMouseLeave={() => setHoveredCandle(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isGreen ? candlestick.gain.stroke : candlestick.loss.stroke}
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
                    stroke={isGreen ? "rgba(5, 150, 105, 1)" : "rgba(220, 38, 38, 1)"}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Scroll indicator when scrolling is needed */}
      {needsScrolling && (
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-muted-foreground">
          Scroll to navigate • {Math.round(scrollPosition * 100)}% through data
        </div>
      )}

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
              <span className="font-mono text-success">${hoveredCandle.high.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-mono text-danger">${hoveredCandle.low.toFixed(2)}</span>
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

// Enhanced volume chart with zoom functionality

export default function ChartsPage() {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState("AAPL");
  const [interval, setInterval] = useState("5m");
  const [zoomLevel, setZoomLevel] = useState(1.5); // Default zoom to show ~50-60 candles
  const [scrollPosition, setScrollPosition] = useState(0);

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

  // Calculate optimal candle width based on data count and zoom level
  const candleWidth = useMemo(() => {
    const containerWidth = 800; // Approximate container width
    const minCandleWidth = 4;
    const maxCandleWidth = 50;
    const availableWidth = containerWidth - 80;
    const targetCandles = Math.max(10, Math.min(candles.length, Math.round(candles.length / zoomLevel)));
    return Math.max(minCandleWidth, Math.min(maxCandleWidth, availableWidth / Math.max(1, targetCandles)));
  }, [candles.length, zoomLevel]);

  // Check for data quality issues
  const hasDuplicateTimestamps = candles.length > 1 &&
    candles.some((candle, index) => index > 0 && candle.timestamp === candles[index - 1].timestamp);

  const uniqueTimestamps = new Set(candles.map(c => c.timestamp)).size;
  const dataQuality = uniqueTimestamps / candles.length;

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(10, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(1, prev / 1.2));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.5);
    setScrollPosition(0);
  };

  // Calculate visible data info
  const totalCandles = candles.length;
  const targetCandles = Math.max(10, Math.min(totalCandles, Math.round(totalCandles / zoomLevel)));
  const maxScroll = Math.max(0, totalCandles - targetCandles);
  const startIndex = Math.min(maxScroll, Math.max(0, Math.round(scrollPosition * maxScroll)));
  const endIndex = Math.min(totalCandles, startIndex + targetCandles);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">{t('nav.charts')} - {symbol}</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('portfolio.symbol')}:</span>
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
            <div className="flex items-center gap-1">
              <Button
                onClick={handleZoomOut}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleResetZoom}
                variant="outline"
                size="sm"
                className="h-8 px-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleZoomIn}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={zoomLevel >= 10}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
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

          {/* Zoom Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Zoom: {zoomLevel.toFixed(1)}x</span>
              <span>Showing: {targetCandles} of {totalCandles} candles</span>
              <span>Range: {startIndex + 1}-{endIndex} of {totalCandles}</span>
              {zoomLevel > 1 && maxScroll > 0 && (
                <span className="text-blue-600">
                  Position: {Math.round(scrollPosition * 100)}% through data
                </span>
              )}
            </div>
            <div className="text-xs">
              {zoomLevel > 1 ? (
                <>
                  Drag to scroll left/right • Use arrow keys to navigate • Use zoom buttons to zoom in/out
                </>
              ) : (
                <>
                  Use zoom buttons to zoom in/out • Drag to scroll when zoomed in
                </>
              )}
            </div>
          </div>

          {candles.length > 0 ? (
            <div className="space-y-4 w-full overflow-hidden">
              {/* Price Chart */}
              <div className="mb-2 w-full overflow-hidden">
                <CandlestickChart
                  data={candles}
                  interval={interval}
                  zoomLevel={zoomLevel}
                  onZoomChange={setZoomLevel}
                  scrollPosition={scrollPosition}
                  onScrollChange={setScrollPosition}
                />
              </div>

              {/* Volume Chart */}
              <div className="mb-2 w-full overflow-hidden">
                <VolumeChart
                  data={candles}
                  interval={interval}
                  zoomLevel={zoomLevel}
                  scrollPosition={scrollPosition}
                  candleWidth={candleWidth}
                />
              </div>

              {/* Fixed Width Scrollbar - No Overflow */}
              {zoomLevel > 1 && (
                <div className="w-full px-16">
                  <div className="relative h-4 bg-muted rounded-full w-full">
                    {/* Scroll track */}
                    <div className="absolute inset-1 bg-background rounded-full"></div>

                    {/* Scroll thumb */}
                    <div
                      className="absolute top-1 h-2 bg-primary rounded-full transition-all duration-200 cursor-pointer hover:bg-primary/80"
                      style={{
                        left: `${scrollPosition * (100 - Math.max(20, 100 / zoomLevel))}%`,
                        width: `${Math.max(20, 100 / zoomLevel)}%`
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const track = e.currentTarget.parentElement;
                        if (!track) return;

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const rect = track.getBoundingClientRect();
                          const clickX = moveEvent.clientX - rect.left;
                          const trackWidth = rect.width;
                          const newScrollRatio = Math.max(0, Math.min(1, clickX / trackWidth));
                          setScrollPosition(newScrollRatio);
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* X-axis Time Labels */}
              <div className="h-6 flex justify-between text-xs text-muted-foreground px-16 w-full overflow-hidden">
                {(() => {
                  const visibleCandles = candles.slice(startIndex, endIndex);
                  const unique: number[] = Array.from(new Set(visibleCandles.map((d: Candle) => d.timestamp)));
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
              <div className="grid grid-cols-4 gap-4 pt-4 border-t w-full">
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
              {t('common.noData')} - {symbol}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t('history.transactions')}</CardTitle>
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
                      className={trade.side === 'BUY' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600 text-white'}
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
                      <div className="text-sm text-muted-foreground">{t('trading.quantity')}</div>
                      <div className="font-mono font-medium">{trade.quantity.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{t('trading.price')}</div>
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
              {t('table.noResults')} - {symbol}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


