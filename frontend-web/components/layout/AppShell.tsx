"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "@/components/layout/Sidebar";
import UserSidebar from "@/components/user/UserSidebar";
import Topbar from "@/components/layout/Topbar";
import { useAuthStore } from "@/lib/authStore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { fadeIn, pageTransition } from "@/lib/motionVariants";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isAdmin, loading, initialized } = useAuthStore();
  
  // Show loading spinner while initializing auth state
  if (!initialized || loading) {
    return (
      <motion.div 
        className="min-h-screen bg-background text-foreground flex items-center justify-center"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <LoadingSpinner size="lg" />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          isAdmin() ? <Sidebar key="admin-sidebar" /> : <UserSidebar key="user-sidebar" />
        ) : null}
      </AnimatePresence>

      <div className={`flex flex-col min-w-0 transition-all duration-300 ${isAuthenticated ? "lg:ml-56" : ""}`}>
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <motion.main 
          className="px-4 lg:px-6 py-6"
          variants={pageTransition}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}


