'use client';

import { useEffect } from 'react';
import { useI18nStore } from '@/lib/i18nStore';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const locale = useI18nStore((state) => state.locale);

  useEffect(() => {
    // Update HTML lang attribute when locale changes
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
