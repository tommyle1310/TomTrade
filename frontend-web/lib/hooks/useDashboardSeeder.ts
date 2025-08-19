import { useState, useEffect } from 'react';
import { useAuthStore } from '../authStore';
import {
  dashboardSeederApi,
  SeedingStatus,
  SeedingResult,
} from '../dashboardSeederQueries';

export const useDashboardSeeder = (startDate?: string, endDate?: string) => {
  const [status, setStatus] = useState<SeedingStatus>({
    isSeeding: false,
    status: 'inactive',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchStatus = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const currentStatus = await dashboardSeederApi.getSeedingStatus(token);
      setStatus(currentStatus);
    } catch (err: any) {
      console.error('Error fetching seeding status:', err);
      setError(err.message);
    }
  };

  const startSeeding = async () => {
    if (!isAuthenticated || !token) {
      setError('Authentication required');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start date and end date are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dashboardSeederApi.startSeeding(
        startDate,
        endDate,
        token
      );

      if (result.status === 'started') {
        setStatus({ isSeeding: true, status: 'active' });
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('Error starting seeding:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopSeeding = async () => {
    if (!isAuthenticated || !token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dashboardSeederApi.stopSeeding(token);

      if (result.status === 'stopped') {
        setStatus({ isSeeding: false, status: 'inactive' });
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('Error stopping seeding:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeeding = async () => {
    if (status.isSeeding) {
      await stopSeeding();
    } else {
      await startSeeding();
    }
  };

  // Fetch status on mount and every 5 seconds
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  return {
    status,
    loading,
    error,
    startSeeding,
    stopSeeding,
    toggleSeeding,
    refetchStatus: fetchStatus,
  };
};
