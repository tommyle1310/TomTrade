import { useI18nStore, type Locale } from '../i18nStore';
import { en, type TranslationKeys } from './en';
import { vi } from './vi';

const translations: Record<Locale, TranslationKeys> = {
  en,
  vi,
};

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if path not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

export function useTranslation() {
  const locale = useI18nStore((state) => state.locale);
  const currentTranslations = translations[locale];

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let value = getNestedValue(currentTranslations, key);
    
    // Replace template parameters like {{min}}, {{max}}
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      });
    }
    
    return value;
  };

  return { t, locale };
}

export { translations, type TranslationKeys, type TranslationKey };
