"use client";

import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [count] = useState(4);
  return (
    <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
        <Button variant="outline" size="sm" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="size-4" />
        </Button>
        <div className="font-semibold">Admin</div>
        <div className="ml-auto flex items-center gap-2">
          <button aria-label="Notifications" className="relative rounded-full border p-2">
            <Bell className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}


