'use client';

import { useLocale } from 'next-intl';
import { useCallback, useEffect } from 'react';

const LANGUAGE_COOKIE_NAME = 'preferredLocale';

export const useLanguagePreference = () => {
  const locale = useLocale();

  // Save language preference to cookies whenever locale changes
  useEffect(() => {
    // Set cookie to persist language preference
    // More robust approach to ensure cookie is properly set
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const cookieValue = `${LANGUAGE_COOKIE_NAME}=${locale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    document.cookie = cookieValue;
  }, [locale]);

  // Function to get preferred language from cookies
  const getPreferredLanguage = useCallback(() => {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === LANGUAGE_COOKIE_NAME && value) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }, []);

  return { locale, getPreferredLanguage };
};
