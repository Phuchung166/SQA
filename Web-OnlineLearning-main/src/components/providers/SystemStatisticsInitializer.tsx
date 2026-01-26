'use client';

import { useEffect } from 'react';
import { fetchSystemStatisticsOnce } from '@/services/systemService';

/**
 * SystemStatisticsInitializer Component
 *
 * Responsible for loading system statistics from the server once per web session.
 * The data is stored in cookies and will be fetched only once per session.
 * This component should be placed high in the component tree (e.g., in layout)
 * so that statistics are fetched early when user accesses the web.
 */
export const SystemStatisticsInitializer = () => {
  useEffect(() => {
    // Fetch system statistics once when the component mounts
    // It will check cookies and only fetch if not already fetched
    fetchSystemStatisticsOnce().then(statistics => {
      if (statistics) {
        console.log('System statistics loaded:', statistics);
      }
    });
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component doesn't render anything
};

export default SystemStatisticsInitializer;
