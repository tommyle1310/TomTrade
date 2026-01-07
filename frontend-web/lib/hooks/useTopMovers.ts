import { useState, useEffect } from 'react';
import { getTopMovers } from '../graphqlClient';
import { TopMoversPaginationResponse } from '../types';
import { useAuthStore } from '../authStore';

export function useTopMovers(page = 1, limit = 10, filter: 'gainers' | 'losers' = 'gainers') {
  const [data, setData] = useState<TopMoversPaginationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function fetchTopMovers() {
      try {
        setLoading(true);
        setError(null);

        const result = await getTopMovers(page, limit, filter, token || undefined);
        
        if (isMounted) {
          setData(result.getTopMovers);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching top movers:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch top movers'));
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchTopMovers();
    } else {
      setLoading(false);
      setError(new Error('No authentication token available'));
    }

    return () => {
      isMounted = false;
    };
  }, [token, page, limit, filter]);

  return { data, loading, error };
}
