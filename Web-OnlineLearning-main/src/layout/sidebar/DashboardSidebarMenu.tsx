'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { UserProfile } from '@/services/userService';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';

interface DashboardSidebarMenuProps {
  profile?: UserProfile | null;
}

const DashboardSidebarMenu: React.FC<DashboardSidebarMenuProps> = ({ profile }) => {
  const pathname = usePathname();
  const t = useTranslations('student_dashboard');
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Remove locale prefix from pathname for comparison
  const getActivePathname = () => {
    // pathname might be like "/en/student-profile" or "/vi/student-dashboard"
    const segments = pathname.split('/').filter(Boolean);
    // If first segment is a locale (en, vi), remove it
    if (segments.length > 0 && ['en', 'vi'].includes(segments[0])) {
      return '/' + segments.slice(1).join('/');
    }
    return pathname;
  };

  const activePath = getActivePathname();

  const getWelcomeName = () => {
    if (!profile) return t('welcome');
    if (profile.first_name && profile.last_name) {
      return t('welcomeName', { name: `${profile.first_name} ${profile.last_name}` });
    }
    if (profile.first_name) return t('welcomeName', { name: profile.first_name });
    return t('welcomeName', { name: profile.account_name || '' });
  };

  const handleLogout = () => {
    // Clear Redux state
    dispatch(logout());

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart_fetched_for_session');

    // Redirect to home
    router.push('/');
  };

  const menuItems = [
    { href: '/student-profile', icon: 'fa-id-badge', label: t('sidebar.myProfile') },
    {
      href: '/student-enrolled-courses',
      icon: 'fa-book-reader',
      label: t('sidebar.enrolledCourses'),
    },
    { href: '/student-orders', icon: 'fa-shopping-bag', label: t('sidebar.myOrders') },
  ];

  const userItems = [{ href: '/', icon: 'fa-sign-out-alt', label: t('sidebar.logout') }];

  return (
    <div className="col-xl-3 col-lg-3 col-md-4">
      <div className="bd-dashboard-menu">
        <h6 className="bd-dashboard-menu-title mt-0">{getWelcomeName()}</h6>
        <ul>
          {menuItems.map(({ href, icon, label }) => (
            <li key={href}>
              <Link href={href} className={activePath === href ? 'active' : ''}>
                <span>
                  <i className={`fa-light ${icon}`}></i>
                </span>{' '}
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <h6 className="bd-dashboard-menu-title">{t('sidebar.userTitle')}</h6>
        <ul>
          {userItems.map(({ href, icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={activePath === href ? 'active' : ''}
                onClick={e => {
                  if (href === '/') {
                    e.preventDefault();
                    handleLogout();
                  }
                }}
              >
                <span>
                  <i className={`fa-light ${icon}`}></i>
                </span>{' '}
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardSidebarMenu;
