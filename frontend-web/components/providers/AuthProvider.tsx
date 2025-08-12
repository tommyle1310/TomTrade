"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  return <>{children}</>;
}
