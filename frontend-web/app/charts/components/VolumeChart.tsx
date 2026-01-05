'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import { Candle } from "../page";
import { roundedTopRectPath } from "@/lib/stylings";
import { volume } from "@/lib/theme";

export const VolumeChart = ({
    data,
    interval,
    zoomLevel,
    scrollPosition,
    candleWidth
}: {
    data: Candle[];
    interval: string;
    zoomLevel: number;
    scrollPosition: number;
    candleWidth: number;
}) => {
    const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    // Calculate visible data based on zoom level (same logic as candlestick chart)
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

    // Handle drag to scroll for volume chart
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

    // Apply scroll position when it changes (synchronize with candlestick chart)
    useEffect(() => {
        if (scrollContainerRef.current) {
            const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollLeft = scrollPosition * maxScroll;
        }
    }, [scrollPosition]);

    if (!visibleData.length) {
        return (
            <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                {/* No volume data */}
            </div>
        );
    }

    const maxVolume = Math.max(...visibleData.map(d => d.volume));
    const chartWidth = Math.max(800 - 80, visibleData.length * candleWidth);

    // Check if scrolling is needed
    const needsScrolling = chartWidth > (800 - 80);

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
                onMouseDown={needsScrolling ? handleMouseDown : undefined}
                onMouseMove={needsScrolling ? handleDragMouseMove : undefined}
                onMouseUp={needsScrolling ? handleMouseUp : undefined}
                onMouseLeave={needsScrolling ? handleMouseLeave : undefined}
            >
                <div style={{ width: `${chartWidth}px`, minWidth: '100%', height: '100%' }}>
                    <svg className="w-full h-full transition-all duration-300 ease-in-out" viewBox={`0 0 ${chartWidth} 150`} preserveAspectRatio="none">
                        {visibleData.map((candle, i) => {
                            const x = i * candleWidth + candleWidth / 2;
                            const barWidth = Math.max(2, candleWidth * 0.8);
                            const height = maxVolume > 0 ? (candle.volume / maxVolume) * 120 : 0; // 120px max height

                            return (
                                <path
                                    key={i}
                                    d={roundedTopRectPath({
                                        x,
                                        bottomY: 150,
                                        width: barWidth,
                                        height,
                                    })}
                                    fill={candle.isGreen ? volume.gain : volume.loss}
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={(e) => handleCandleMouseMove(e, candle)}
                                    onMouseLeave={() => setHoveredCandle(null)}
                                />

                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Volume tooltip */}
            {hoveredCandle && (
                <div
                    className="absolute bg-background border rounded-lg p-2 shadow-lg z-20 pointer-events-none"
                    style={{
                        left: Math.min(tooltipPosition.x + 10, 200),
                        top: Math.max(tooltipPosition.y - 80, 10),
                    }}
                >
                    <div className="text-xs font-medium text-muted-foreground">
                        {new Date(hoveredCandle.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-sm font-mono mt-1">
                        Volume: {hoveredCandle.volume.toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    );
};