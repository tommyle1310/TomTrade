'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useI18nStore, type Locale } from '@/lib/i18nStore';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export function LanguageSwitcher() {
  const { locale } = useTranslation();
  const setLocale = useI18nStore((state) => state.setLocale);
  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-2.5 h-9 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Globe className="size-4" />
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <span>{currentLang.flag}</span>
            <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1">
        <div className="flex flex-col">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                locale === lang.code && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
