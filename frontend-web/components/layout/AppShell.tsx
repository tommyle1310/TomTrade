"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import UserSidebar from "@/components/user/UserSidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuthStore } from "@/lib/authStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isAdmin, loading, initialized } = useAuthStore();
  
  // Show loading spinner while initializing auth state
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isAuthenticated ? (
        isAdmin() ? <Sidebar /> : <UserSidebar />
      ) : null}

      <div className={`flex flex-col min-w-0 ${isAuthenticated ? "lg:ml-54" : ""}`}>
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="px-4 lg:px-6 py-4">
          <div className="mx-auto w-full max-w-[1400px] ">{children}</div>
        </main>
      </div>
    </div>
  );
}


