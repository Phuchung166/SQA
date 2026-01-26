'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { USER_ROLES } from '@/constants/UserConstants';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectUser, logout } from '@/redux/slices/authSlice';

interface User {
  phone?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  gender?: string;
  account_name: string;
  date_of_birth?: string;
  bio?: string;
  email?: string;
  roles?: string[]; // Array of roles from API
}

const UserAvatarDropdown = () => {
  const t = useTranslations('Header');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Đóng dropdown khi click bên ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

  if (!user) return null;

  // Check if user is instructor
  const isInstructor = user.roles?.includes(USER_ROLES.INSTRUCTOR);

  return (
    <div className="bd-header-user-dropdown" ref={dropdownRef}>
      <button className="bd-user-avatar-btn" onClick={() => setIsOpen(!isOpen)} type="button">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.account_name}
            width={40}
            height={40}
            className="user-avatar-img"
          />
        ) : (
          <div className="user-avatar-placeholder">
            <i className="fa-regular fa-user"></i>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="bd-user-dropdown-menu">
          <div className="bd-user-dropdown-header">
            <div className="user-info">
              <h6 className="user-name">{user.account_name}</h6>
              {user.first_name && user.last_name && (
                <p className="user-email">{`${user.first_name} ${user.last_name}`}</p>
              )}
              {user.phone && <p className="user-phone">{user.phone}</p>}
            </div>
          </div>
          <div className="bd-user-dropdown-body">
            <ul>
              {isInstructor ? (
                // Instructor Menu Items
                <>
                  <li>
                    <Link href="/instructor-profile" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-user"></i>
                      <span>{t('profile') ?? 'My Profile'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/instructor-courses" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-book"></i>
                      <span>{t('myCourses') ?? 'My Courses'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/create-course" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-plus-circle"></i>
                      <span>{t('createCourse') ?? 'Create Course'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/create-group-course" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-plus-circle"></i>
                      <span>{t('createGroupCourse') ?? 'Create Course'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/instructor-my-quiz-attempts" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-question"></i>
                      <span>{t('quizzes') ?? 'My Quizzes'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/instructor-income" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-dollar-sign"></i>
                      <span>{t('income') ?? 'Income'}</span>
                    </Link>
                  </li>
                  {/* <li>
                    <Link href="/instructor-reviews" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-users"></i>
                      <span>{t('reviews') ?? 'Reviews'}</span>
                    </Link>
                  </li> */}
                </>
              ) : (
                // Student Menu Items
                <>
                  <li>
                    <Link href="/student-profile" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-user"></i>
                      <span>{t('profile') ?? 'My Profile'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/student-enrolled-courses" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-book"></i>
                      <span>{t('myCourses') ?? 'My Courses'}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/student-orders" onClick={() => setIsOpen(false)}>
                      <i className="fa-light fa-shopping-bag"></i>
                      <span>{t('myOrders') ?? 'My Orders'}</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="bd-user-dropdown-footer">
            <button onClick={handleLogout} className="bd-logout-btn">
              <i className="fa-light fa-arrow-right-from-bracket"></i>
              <span>{t('logout') ?? 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatarDropdown;
