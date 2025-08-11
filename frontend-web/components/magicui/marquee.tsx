"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = React.HTMLAttributes<HTMLDivElement> & {
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
};

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 2,
  ...props
}: MarqueeProps) {
  const content = React.useMemo(
    () => Array.from({ length: Math.max(1, repeat) }, (_, i) => (
      <div key={i} className={cn("flex items-center gap-6", vertical ? "flex-col" : "flex-row")}> 
        {children}
      </div>
    )),
    [children, repeat, vertical],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        vertical && "[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "marquee-track flex gap-6",
          vertical ? "flex-col" : "flex-row",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {content}
      </div>
    </div>
  );
}


