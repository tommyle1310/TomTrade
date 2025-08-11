"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type AnimatedListProps = React.HTMLAttributes<HTMLDivElement> & {
  delay?: number;
};

export function AnimatedList({ children, className, delay = 1000, ...props }: AnimatedListProps) {
  const items = React.Children.toArray(children);
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {items.map((child, index) => (
        <div
          key={index}
          style={{ animationDelay: `${index * delay}ms` }}
          className="opacity-0 [animation:fade-in-up_500ms_ease_forwards]"
        >
          {child}
        </div>
      ))}
    </div>
  );
}


