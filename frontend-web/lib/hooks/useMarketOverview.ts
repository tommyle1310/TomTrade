import { useState, useEffect } from 'react';
import { getMarketOverview } from '../graphqlClient';
import { MarketOverviewPaginationResponse } from '../types';
import { useAuthStore } from '../authStore';

export function useMarketOverview(page = 1, limit = 10) {
  const [data, setData] = useState<MarketOverviewPaginationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function fetchMarketOverview() {
      try {
        setLoading(true);
        setError(null);

        const result = await getMarketOverview(page, limit, token || undefined);
        
        if (isMounted) {
          setData(result.getMarketOverview);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching market overview:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch market overview'));
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchMarketOverview();
    } else {
      setLoading(false);
      setError(new Error('No authentication token available'));
    }

    return () => {
      isMounted = false;
    };
  }, [token, page, limit]);

  return { data, loading, error };
}
