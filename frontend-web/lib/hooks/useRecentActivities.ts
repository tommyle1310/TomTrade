import { useState, useEffect } from 'react';
import { getRecentActivities } from '../graphqlClient';
import { ActivityPaginationResponse } from '../types';
import { useAuthStore } from '../authStore';

export function useRecentActivities(page = 1, limit = 20) {
  const [data, setData] = useState<ActivityPaginationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    async function fetchActivities() {
      try {
        setLoading(true);
        setError(null);

        const result = await getRecentActivities(page, limit, token || undefined);
        
        if (isMounted) {
          setData(result.getRecentActivities);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching recent activities:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchActivities();
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
