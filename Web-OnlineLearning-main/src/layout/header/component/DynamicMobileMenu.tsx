'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { selectIsLoggedIn, selectIsInstructor } from '@/redux/slices/authSlice';
import useGlobalContext from '@/hooks/useContexts';
import { useTranslations } from 'next-intl';

interface DashboardMenuItem {
  titleKey: string;
  link: string;
}

const DynamicMobileMenu = () => {
  const { toggleSidebarMenu } = useGlobalContext();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isInstructor = useAppSelector(selectIsInstructor);
  const t = useTranslations('Dashboard');
  const tHeader = useTranslations('Header');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Instructor Dashboard Menu
  const instructorMenuItems: DashboardMenuItem[] = [
    {
      titleKey: 'profile',
      link: '/instructor-profile',
    },
    {
      titleKey: 'myCourses',
      link: '/instructor-courses',
    },
    {
      titleKey: 'createCourse',
      link: '/create-course',
    },
    {
      titleKey: 'createGroupCourse',
      link: '/create-group-course',
    },
    {
      titleKey: 'quizzes',
      link: '/instructor-my-quiz-attempts',
    },
    {
      titleKey: 'income',
      link: '/instructor-income',
    },
    // {
    //   titleKey: 'reviews',
    //   link: '/instructor-reviews',
    // },
  ];

  // Student Dashboard Menu
  const studentMenuItems: DashboardMenuItem[] = [
    {
      titleKey: 'profile',
      link: '/student-profile',
    },
    {
      titleKey: 'myCourses',
      link: '/student-enrolled-courses',
    },
    {
      titleKey: 'myOrders',
      link: '/student-orders',
    },
  ];

  const dashboardMenuItems = isInstructor ? instructorMenuItems : studentMenuItems;

  return (
    <>
      <ul>
        {isLoggedIn && (
          <li className={`${activeMenu === 'dashboard' ? 'active' : ''}`}>
            <Link
              href="#"
              onClick={e => {
                e.preventDefault();
                setActiveMenu(activeMenu === 'dashboard' ? null : 'dashboard');
              }}
            >
              {isInstructor
                ? (t('instructorDashboard') ?? 'Instructor Dashboard')
                : (t('studentDashboard') ?? 'Student Dashboard')}
            </Link>
            <button
              onClick={() => setActiveMenu(activeMenu === 'dashboard' ? null : 'dashboard')}
              className={`bd-menu-close ${activeMenu === 'dashboard' ? 'mean-clicked' : ''}`}
            >
              <i className="fa fa-chevron-right"></i>
            </button>
            {activeMenu === 'dashboard' && (
              <ul className="submenu" style={{ display: 'block' }}>
                {dashboardMenuItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.link} onClick={toggleSidebarMenu}>
                      {tHeader(item.titleKey) ?? item.titleKey}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}
      </ul>
    </>
  );
};

export default DynamicMobileMenu;
