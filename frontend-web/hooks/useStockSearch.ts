import { useState, useEffect, useCallback } from 'react';
import { searchStocks } from '@/lib/graphqlClient';
import { useAuthStore } from '@/lib/authStore';

export interface StockSearchResult {
  ticker: string;
  companyName: string;
  avatar?: string | null;
  exchange: string;
  sector?: string;
  industry?: string;
  isTradable: boolean;
}

export function useStockSearch(query: string, debounceMs: number = 300) {
  const { token } = useAuthStore();
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear results if query is empty
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      try {
        const result = await searchStocks(query, token || undefined);
        if (result?.stocks) {
          // Limit to top 10 results
          setResults(result.stocks.slice(0, 10));
        } else {
          setResults([]);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to search stocks');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      setLoading(false);
    };
  }, [query, debounceMs, token]);

  return { results, loading, error };
}
