'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;

    // Save the language preference to cookie FIRST, before navigation
    // Use a more robust cookie format with Secure flag (when HTTPS)
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `preferredLocale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

    // Replace the locale in the pathname while preserving query parameters
    // Pattern: /[locale]/path?query=params -> /[newLocale]/path?query=params
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');

    // Preserve search parameters (query string)
    const searchParams = new URLSearchParams(window.location.search);
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${newPathname}?${queryString}` : newPathname;

    router.push(fullPath);
  };

  const items: MenuProps['items'] = [
    {
      key: 'en',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇬🇧</span>
          <span>English</span>
          {locale === 'en' && <span style={{ color: '#1890ff' }}>✓</span>}
        </div>
      ),
      onClick: () => handleLanguageChange('en'),
    },
    {
      key: 'vi',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇻🇳</span>
          <span>Tiếng Việt</span>
          {locale === 'vi' && <span style={{ color: '#1890ff' }}>✓</span>}
        </div>
      ),
      onClick: () => handleLanguageChange('vi'),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <button
        className="meta-icon"
        type="button"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <GlobalOutlined style={{ fontSize: '18px' }} />
        <span style={{ fontSize: '14px', textTransform: 'uppercase' }}>{locale}</span>
      </button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
