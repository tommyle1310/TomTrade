import { useState, useEffect } from 'react';
import { getHoldings } from '../graphqlClient';
import { HoldingPaginationResponse } from '../types';
import { useAuthStore } from '../authStore';

export function useHoldings(page = 1, limit = 10) {
  const [data, setData] = useState<HoldingPaginationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function fetchHoldings() {
      try {
        setLoading(true);
        setError(null);

        const result = await getHoldings(page, limit, token || undefined);
        
        if (isMounted) {
          setData(result.getHoldings);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching holdings:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch holdings'));
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchHoldings();
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
