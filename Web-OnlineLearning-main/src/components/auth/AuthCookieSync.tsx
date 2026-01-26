'use client';
import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { selectAuth } from '@/redux/slices/authSlice';
import { setAuthCookies, clearAuthCookies } from '@/utils/authCookies';

/**
 * Component to sync Redux auth state with cookies
 * This ensures middleware can access user roles for route protection
 */
export const AuthCookieSync = () => {
  const { token, user, isLoggedIn } = useAppSelector(selectAuth);

  useEffect(() => {
    if (isLoggedIn && token && user) {
      // Sync auth state to cookies
      setAuthCookies(token, user);
    } else {
      // Clear cookies when logged out
      clearAuthCookies();
    }
  }, [isLoggedIn, token, user]);

  // This component doesn't render anything
  return null;
};
