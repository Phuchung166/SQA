'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import logoImg from '../../../public/assets/images/logo/logo_miniv2.png';
import MobileMenu from '../header/component/MainMobileMenu';
import DynamicMobileMenu from '../header/component/DynamicMobileMenu';
import useGlobalContext from '@/hooks/useContexts';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectIsLoggedIn, selectIsInstructor, logout } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { userService } from '@/services/userService';
import { useNotification } from '@/hooks/useMessage';

const SidebarMenu = () => {
  const { openSidebar, setOpenSidebar } = useGlobalContext();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useTranslations('Header');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isInstructor = useAppSelector(selectIsInstructor);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/courses-filter-search?search=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
      setOpenSidebar(false);
    }
  };

  const handleLogout = () => {
    setLoading(true);
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart_fetched_for_session');
    setOpenSidebar(false);
    router.push('/');
    setLoading(false);
  };

  const handleBecomeInstructor = async () => {
    if (!isLoggedIn) {
      router.push('/sign-in');
      setOpenSidebar(false);
      return;
    }

    try {
      setLoading(true);
      const result = await userService.becomeToInstructor();

      // Show success message from API
      notification.success({
        message: tNotif ? tNotif('success') : 'Success',
        description: result.message || 'Successfully became instructor! Please login again.',
        placement: 'topRight',
        duration: 3,
      });

      // Logout user - clear localStorage and Redux
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart_fetched_for_session');

        // Clear Redux state
        dispatch(logout());

        // Redirect to sign-in page
        router.push('/sign-in');
        setOpenSidebar(false);
      }, 1500);
    } catch (error: unknown) {
      const extractErrorMessage = (err: unknown): string | undefined => {
        if (!err) return undefined;
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        try {
          return String(err);
        } catch {
          return undefined;
        }
      };
      const errorMsg = extractErrorMessage(error) || 'Failed to become instructor';
      notification.error({
        message: tNotif ? tNotif('error') : 'Error',
        description: errorMsg,
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* -- Offcanvas area start -- */}
      <div className="fix">
        <div className={`bd-offcanvas-area ${openSidebar ? 'info-open' : ''}`}>
          <div className="bd-offcanvas-wrapper">
            <div className="bd-offcanvas-content">
              <div className="bd-offcanvas-top d-flex justify-content-between align-items-center mb-30">
                <div className="bd-offcanvas-logo">
                  <Link href="/">
                    <Image
                      style={{ width: '100%', height: 'auto' }}
                      src={logoImg}
                      alt="logo not found"
                    />
                  </Link>
                </div>
                <div className="bd-offcanvas-close">
                  <button
                    onClick={() => setOpenSidebar(!openSidebar)}
                    className="bd-offcanvas-close-icon animation--flip"
                  >
                    <span className="bd-offcanvas-m-lines">
                      <span className="bd-offcanvas-m-line line--1"></span>
                      <span className="bd-offcanvas-m-line line--2"></span>
                      <span className="bd-offcanvas-m-line line--3"></span>
                    </span>
                  </button>
                </div>
              </div>
              <div className="bd-offcanvas-search mb-30">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    name="bd-offcanvasSearch"
                    placeholder={t('searchPlaceholder') ?? 'Search here'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" onClick={handleSearch}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </form>
              </div>
              <div className="bd-mobile-menu-smaller">
                <div className="bd-offcanvas-menu mb-30">
                  <nav>
                    <MobileMenu />
                  </nav>
                </div>
                {isLoggedIn && (
                  <div className="bd-offcanvas-menu mb-30">
                    <nav>
                      <DynamicMobileMenu />
                    </nav>
                  </div>
                )}
              </div>

              {/* Account Actions */}
              <div className="bd-offcanvas-btn-wrap mb-30">
                <div className="bd-offcanvas-btn d-flex gap-15">
                  {isLoggedIn ? (
                    <button
                      className="bd-btn btn-outline-border-secondary flex-grow-1"
                      onClick={handleLogout}
                      disabled={loading}
                      style={{
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      <i className="fa-solid fa-sign-out" style={{ marginRight: 20 }}></i>{' '}
                      {loading ? 'Logging out...' : (t('logout') ?? 'Logout')}
                    </button>
                  ) : (
                    <>
                      <Link
                        className="bd-btn btn-primary flex-grow-1"
                        href="/sign-in"
                        onClick={() => setOpenSidebar(false)}
                      >
                        <i className="fa-solid fa-sign-in"></i> {t('logIn') ?? 'Log In'}
                      </Link>
                      <Link
                        className="bd-btn btn-outline-border-secondary flex-grow-1"
                        href="/sign-up"
                        onClick={() => setOpenSidebar(false)}
                      >
                        <i className="fa-solid fa-user-plus"></i> {t('getStarted') ?? 'Sign Up'}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {!isInstructor && (
                <div className="bd-offcanvas-btn-wrap mb-30">
                  <h4 className="bd-offcanvas-title-meta">
                    {t('becomeInstructor') ?? 'Become An Instructor'}
                  </h4>
                  <div className="bd-offcanvas-btn">
                    {!isLoggedIn ? (
                      <Link
                        href="/become-instructor"
                        className="bd-btn btn-primary w-100"
                        onClick={() => setOpenSidebar(false)}
                      >
                        <i className="fa-solid fa-chalkboard-user"></i>{' '}
                        {t('becomeInstructor') ?? 'Become An Instructor'}
                      </Link>
                    ) : (
                      <button
                        onClick={handleBecomeInstructor}
                        disabled={loading}
                        style={{
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                        }}
                        className="bd-btn btn-primary w-100"
                      >
                        <i className="fa-solid fa-chalkboard-user"></i>{' '}
                        {loading
                          ? 'Processing...'
                          : (t('becomeInstructor') ?? 'Become An Instructor')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => setOpenSidebar(false)}
        className={`bd-offcanvas-overlay ${openSidebar ? 'overlay-open' : ''}`}
      ></div>
      <div className="bd-offcanvas-overlay-white"></div>
      {/* -- Offcanvas area start --   */}
    </>
  );
};
export default SidebarMenu;
