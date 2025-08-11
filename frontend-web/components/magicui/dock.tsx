"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DockProps = React.HTMLAttributes<HTMLDivElement> & {
  iconSize?: number;
  magnification?: number;
  iconDistance?: number;
  direction?: "top" | "middle" | "bottom";
};

export function Dock({
  className,
  children,
  iconSize = 40,
  magnification = 60,
  iconDistance = 140,
  direction = "middle",
  ...props
}: DockProps) {
  const mouseX = React.useRef<number | null>(null);
  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.current = e.clientX - rect.left;
      }}
      onMouseLeave={() => (mouseX.current = null)}
      className={cn(
        "flex items-end gap-2 rounded-2xl border bg-background/60 p-2 backdrop-blur",
        direction === "top" && "items-start",
        direction === "bottom" && "items-end",
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <DockIcon
          key={index}
          size={iconSize}
          magnification={magnification}
          distance={iconDistance}
          mouseXRef={mouseX}
        >
          {child as React.ReactNode}
        </DockIcon>
      ))}
    </div>
  );
}

function DockIcon({
  size,
  magnification,
  distance,
  mouseXRef,
  children,
}: {
  size: number;
  magnification: number;
  distance: number;
  mouseXRef: React.MutableRefObject<number | null>;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(size);

  React.useEffect(() => {
    function update() {
      const container = ref.current?.parentElement;
      if (!container) return;
      const rect = ref.current!.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const x = mouseXRef.current;
      if (x === null) {
        setWidth(size);
        return;
      }
      const center = rect.left - containerRect.left + rect.width / 2;
      const dist = Math.abs(x - center);
      const s = Math.max(size, magnification - (dist / distance) * (magnification - size));
      setWidth(s);
    }
    const id = window.setInterval(update, 16);
    return () => window.clearInterval(id);
  }, [distance, magnification, mouseXRef, size]);

  return (
    <div ref={ref} style={{ width, height: width }} className="grid place-items-center transition-[width,height] duration-75">
      {children}
    </div>
  );
}


