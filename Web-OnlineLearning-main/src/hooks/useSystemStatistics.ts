import { useState, useEffect } from 'react';
import {
  SystemStatistics,
  getSystemStatisticsFromCookie,
  fetchSystemStatisticsOnce,
} from '@/services/systemService';

/**
 * Hook to access system statistics
 * Returns cached statistics from cookies or fetches them if not available
 */
export const useSystemStatistics = () => {
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        // Try to get from cookie first
        const cachedStats = getSystemStatisticsFromCookie();
        
        if (cachedStats) {
          setStatistics(cachedStats);
          setLoading(false);
        } else {
          // If not in cookie, fetch from API
          const stats = await fetchSystemStatisticsOnce();
          setStatistics(stats);
          setLoading(false);
        }
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  return { statistics, loading, error };
};
