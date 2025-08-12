"use client";

import AdminOverview from '@/components/admin/Overview';
import UserDashboard from '@/components/user/UserDashboard';
import { useAuthStore } from '@/lib/authStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Home() {
  const { isAuthenticated, isAdmin, loading, initialized } = useAuthStore();

  // Show loading spinner while initializing auth state
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, show a welcome message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to TomTrade</h1>
          <p className="text-muted-foreground">Please sign in to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans pb-20 gap-16">
      {isAdmin() ? <AdminOverview /> : <UserDashboard />}
    </div>
  );
}
