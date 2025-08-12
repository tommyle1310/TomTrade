"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-col min-w-0 lg:ml-54">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="px-4 lg:px-6 py-4">
          <div className="mx-auto w-full max-w-[1400px] ">{children}</div>
        </main>
      </div>
    </div>
  );
}


