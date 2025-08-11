"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[200px_1fr] bg-background text-foreground">
      <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
        <Sidebar />
      </div>

      <div className="flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="px-4 lg:px-6 py-4">
          <div className="mx-auto w-full max-w-[1400px] ">{children}</div>
        </main>
      </div>
    </div>
  );
}


