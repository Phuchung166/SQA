/**
 * Suppress Ant Design React Compatibility Warning
 *
 * This file suppresses the warning:
 * "[antd: compatible] antd v5 support React is 16 ~ 18"
 *
 * Ant Design v5 officially supports React 16-18, but works perfectly with React 18.3.1
 * The warning is about React 19, which we're not using.
 *
 * This must be imported BEFORE any Ant Design components.
 */

'use client';

if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;

  // Suppress console.error for Ant Design compatibility warnings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.error = (...args: any[]) => {
    const message = String(args[0]);
    if (message.includes('[antd: compatible]') || message.includes('antd v5 support React')) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suppress console.warn for Ant Design compatibility warnings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    const message = String(args[0]);
    if (message.includes('[antd: compatible]') || message.includes('antd v5 support React')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export {};
