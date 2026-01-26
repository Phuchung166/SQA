/**
 * Utility functions for syncing auth state with cookies
 * Cookies are used by middleware for server-side route protection
 */

import Cookies from 'js-cookie';
import { User } from '@/redux/slices/authSlice';

const TOKEN_COOKIE_NAME = 'token';
const USER_COOKIE_NAME = 'user';

// Cookie expires in 7 days
const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

/**
 * Set auth cookies when user logs in
 */
export const setAuthCookies = (token: string, user: User) => {
  Cookies.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
  Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
};

/**
 * Clear auth cookies when user logs out
 */
export const clearAuthCookies = () => {
  Cookies.remove(TOKEN_COOKIE_NAME);
  Cookies.remove(USER_COOKIE_NAME);
};

/**
 * Get token from cookie
 */
export const getTokenFromCookie = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE_NAME);
};

/**
 * Get user from cookie
 */
export const getUserFromCookie = (): User | null => {
  const userStr = Cookies.get(USER_COOKIE_NAME);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    return null;
  }
};

/**
 * Update user cookie (e.g., when profile is updated)
 */
export const updateUserCookie = (user: User) => {
  Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: string): boolean => {
  const user = getUserFromCookie();
  return user?.roles?.includes(role) || false;
};

/**
 * Check if user is logged in
 */
export const isAuthenticated = (): boolean => {
  return !!getTokenFromCookie();
};
