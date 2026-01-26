'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';

const InstructorSidebarMenu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations('student_dashboard.sidebar');
  const user = useAppSelector(state => state.auth.user);

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
    { href: '/instructor-profile', icon: 'fa-id-badge', label: t('myProfile') },

    { href: '/student-enrolled-courses', icon: 'fa-book-reader', label: t('enrolledCourses') },
    { href: '/student-orders', icon: 'fa-shopping-bag', label: t('myOrders') },
  ];

  const instructorItems = [
    // { href: '/instructor-reviews', icon: 'fa-comment-dots', label: t('reviews') },
    { href: '/instructor-income', icon: 'fa-receipt', label: t('income') },
    { href: '/instructor-courses', icon: 'fa-chalkboard-user', label: t('myCourses') },
    { href: '/instructor-my-quiz-attempts', icon: 'fa-file-lines', label: t('myQuizAttempts') },
  ];

  const displayName = user?.first_name || user?.account_name || '';

  return (
    <div className="col-xl-3 col-lg-3 col-md-4">
      <div className="bd-dashboard-menu">
        <h6 className="bd-dashboard-menu-title mt-0">
          {t('welcomeMessage')}
          {displayName ? `, ${displayName}` : ''}
        </h6>
        <ul>
          {menuItems.map(({ href, icon, label }) => (
            <li key={href}>
              <Link href={href} className={pathname === href ? 'active' : ''}>
                <span>
                  <i className={`fa-light ${icon}`}></i>
                </span>{' '}
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <h6 className="bd-dashboard-menu-title">{t('instructorTitle')}</h6>
        <ul>
          {instructorItems.map(({ href, icon, label }) => (
            <li key={href}>
              <Link href={href} className={pathname === href ? 'active' : ''}>
                <span>
                  <i className={`fa-light ${icon}`}></i>
                </span>{' '}
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <h6 className="bd-dashboard-menu-title">{t('userTitle')}</h6>
        <ul>
          <li>
            <Link href="/" onClick={handleLogout} className="logout-btn" type="button">
              <span>
                <i className="fa-light fa-sign-out-alt"></i>
              </span>{' '}
              {t('logout')}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InstructorSidebarMenu;
