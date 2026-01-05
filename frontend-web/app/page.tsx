"use client";

import { motion } from "motion/react";
import AdminOverview from '@/components/admin/Overview';
import UserDashboard from '@/components/user/UserDashboard';
import { useAuthStore } from '@/lib/authStore';
import { useTranslation } from '@/lib/translations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { fadeInUp } from '@/lib/motionVariants';

export default function Home() {
  const { isAuthenticated, isAdmin, loading, initialized } = useAuthStore();
  const { t } = useTranslation();

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
      <motion.div 
        className="min-h-[70vh] bg-background text-foreground flex items-center justify-center"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t('dashboard.welcome')} TomTrade
          </h1>
          <p className="text-muted-foreground">{t('auth.signInToContinue')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="font-sans pb-20 gap-16">
      {isAdmin() ? <AdminOverview /> : <UserDashboard />}
    </div>
  );
}
