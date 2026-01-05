import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Locale = 'en' | 'vi';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale: Locale) => set({ locale }),
    }),
    {
      name: 'tomtrade-i18n',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
