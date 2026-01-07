import { useState, useEffect } from 'react';
import { getUserMetricCards } from '../graphqlClient';
import { MetricCard } from '../types';
import { useAuthStore } from '../authStore';

export function useUserMetricCards() {
  const [data, setData] = useState<MetricCard[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function fetchMetricCards() {
      try {
        setLoading(true);
        setError(null);

        const result = await getUserMetricCards(token || undefined);
        
        if (isMounted) {
          setData(result.getUserMetricCards);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching user metric cards:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch metric cards'));
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchMetricCards();
    } else {
      setLoading(false);
      setError(new Error('No authentication token available'));
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  return { data, loading, error };
}
