import axios from '@/config/axios';
import { parseApiError } from './apiError';
import Cookies from 'js-cookie';

const STATISTICS_COOKIE_NAME = 'system_statistics';
const STATISTICS_FETCHED_COOKIE_NAME = 'statistics_fetched';

// Cookie expires in 1 day
const COOKIE_OPTIONS = {
  expires: 1,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export interface SystemStatistics {
  total_users: number;
  total_courses: number;
  total_instructors: number;
  total_orders: number;
  total_success_orders: number;
  total_revenue: number;
  system_income: number;
}

/**
 * Get system statistics from admin API
 */
export const getSystemStatistics = async (): Promise<SystemStatistics> => {
  try {
    const response = await axios.get('/admin/statistics-system');
    const data = response.data as SystemStatistics;
    
    // Store in cookies after successful fetch
    setSystemStatisticsCookie(data);
    
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Set system statistics to cookie
 */
export const setSystemStatisticsCookie = (statistics: SystemStatistics) => {
  Cookies.set(STATISTICS_COOKIE_NAME, JSON.stringify(statistics), COOKIE_OPTIONS);
  // Mark that statistics have been fetched for this session
  Cookies.set(STATISTICS_FETCHED_COOKIE_NAME, 'true', COOKIE_OPTIONS);
};

/**
 * Get system statistics from cookie
 */
export const getSystemStatisticsFromCookie = (): SystemStatistics | null => {
  const statisticsStr = Cookies.get(STATISTICS_COOKIE_NAME);
  if (!statisticsStr) return null;

  try {
    return JSON.parse(statisticsStr);
  } catch {
    return null;
  }
};

/**
 * Check if statistics have been fetched in this session
 */
export const hasStatisticsBeenFetched = (): boolean => {
  return Cookies.get(STATISTICS_FETCHED_COOKIE_NAME) === 'true';
};

/**
 * Clear statistics cookies
 */
export const clearSystemStatisticsCookie = () => {
  Cookies.remove(STATISTICS_COOKIE_NAME);
  Cookies.remove(STATISTICS_FETCHED_COOKIE_NAME);
};

/**
 * Fetch and cache system statistics if not already fetched
 * This should be called once when the web is accessed
 */
export const fetchSystemStatisticsOnce = async (): Promise<SystemStatistics | null> => {
  // Check if already fetched in this session
  if (hasStatisticsBeenFetched()) {
    return getSystemStatisticsFromCookie();
  }

  try {
    return await getSystemStatistics();
  } catch (error) {
    console.error('Failed to fetch system statistics:', error);
    return null;
  }
};
