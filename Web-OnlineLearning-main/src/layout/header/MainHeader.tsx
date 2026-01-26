'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LogoImg from '../../../public/assets/images/logo/logo.svg';
import SidebarCart from '@/components/common/sidebar-cart/SidebarCart';
import HeaderSearch from './component/HeaderSearch';
import SidebarMenu from '../sidebar/SidebarMenu';
// CommonHeaderMainMenu is not used in current header layout
import CategoryDropdown from './component/CategoryDropdown';
import UserAvatarDropdown from './component/UserAvatarDropdown';
import LanguageSwitcher from './component/LanguageSwitcher';
import useGlobalContext from '@/hooks/useContexts';
import useCart from '@/hooks/useCart';
import { useTranslations } from 'next-intl';
import { userService } from '@/services/userService';
import { useNotification } from '@/hooks/useMessage';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectIsLoggedIn, selectIsInstructor, logout } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';

const MainHeader = () => {
  const { scrollDirection, toggleSidebarMenu } = useGlobalContext();
  const t = useTranslations('Header');
  const tNotif = useTranslations('notification');
  const notification = useNotification();
  const [openCart, setOpenCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  //cart quantity
  const { getCartProductQuantity } = useCart();
  const TotalCartQuantity = getCartProductQuantity();
  //search functionality
  const [openSearchField, setOpenSearchField] = useState<boolean>(false);
  const handleSearchToggle = () => {
    setOpenSearchField(!openSearchField);
  };

  // Use Redux selectors
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isInstructor = useAppSelector(selectIsInstructor);

  // Handle header search form submission
  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/courses-filter-search?search=${encodeURIComponent(headerSearchQuery.trim())}`);
      setHeaderSearchQuery('');
    }
  };

  const handleBecomeInstructor = async () => {
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
      {/* -- Header area start -- */}
      <header>
        <div className="bd-header-top">
          <div className="bd-header-top-left">
            <ul>
              <li>
                <Link href="tel:+84852025405">
                  <span>
                    <i className="fa-solid fa-phone-volume"></i>
                  </span>
                  {t('phone') ?? '+84 358745832'}
                </Link>
              </li>
              <li>
                <Link href="mailto:ntt080703@gmail.com">
                  <span>
                    <i className="fa-sharp fa-light fa-envelope"></i>
                  </span>
                  {t('email') ?? 'ntt080703@gmail.com'}
                </Link>
              </li>
            </ul>
          </div>
          {!isInstructor && (
            <div className="bd-header-top-right text-md-end">
              {!isLoggedIn ? (
                <Link href="/become-instructor" className="bd-instructor-btn">
                  {t('becomeInstructor') ?? 'Become An Instructor'}
                </Link>
              ) : (
                <span
                  onClick={handleBecomeInstructor}
                  style={{
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                  className="bd-instructor-btn"
                >
                  {loading ? 'Processing...' : (t('becomeInstructor') ?? 'Become An Instructor')}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={`bd-header-area header-style-one ${scrollDirection === 'down' ? 'bd-sticky' : ''}`}
        >
          <div className="bd-header-inner">
            <div className="bd-header-left">
              <div className="bd-header-logo">
                <Link href="/">
                  <Image src={LogoImg} style={{ width: '100%', height: 'auto' }} alt="logo" />
                </Link>
              </div>
              <div className="bd-header-category d-none d-lg-block">
                <div className="bd-category-btn">
                  <i className="fa-solid fa-grid"></i> {t('category') ?? 'Category'}
                </div>
                <div className="bd-category-dropdown">
                  <nav>
                    <CategoryDropdown />
                  </nav>
                </div>
              </div>
            </div>
            <div className="bd-header-shop-search w d-none d-xl-block w-25">
              <form onSubmit={handleHeaderSearch}>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder') ?? 'Search by Books'}
                  value={headerSearchQuery}
                  onChange={e => setHeaderSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>
            </div>
            {/* <div className="bd-header-menu">
              <nav className="main-menu bd-mobile-menu-active d-none d-xl-block">
                <CommonHeaderMainMenu />
              </nav>
            </div> */}
            <div className="bd-header-right">
              <div className="bd-header-meta">
                {/* <span className="d-none d-xl-block "></span> */}
                <LanguageSwitcher />
                <button
                  onClick={() => setOpenCart(true)}
                  className="cartmini-open-btn meta-icon"
                  type="button"
                >
                  <i className="fa-regular fa-cart-shopping"></i>
                  <span className="item-number">{TotalCartQuantity}</span>
                </button>
              </div>
              <div className="bd-header-sign-btn">
                {isLoggedIn ? (
                  <UserAvatarDropdown />
                ) : (
                  <>
                    <Link className="bd-btn btn-outline-primary h-40px" href="/sign-in">
                      {t('login') ?? 'Login'}
                    </Link>
                    <Link className="bd-btn btn-outline-border-primary h-40px" href="/sign-up">
                      {t('register') ?? 'Register'}
                    </Link>
                  </>
                )}
              </div>
              <div className="bd-header-hamburger">
                <div className="sidebar-toggle">
                  <Link onClick={toggleSidebarMenu} href="#" className="bar-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* -- Header area end -- */}
      {/* header search input */}
      <HeaderSearch setOpenSearchField={setOpenSearchField} openSearchField={openSearchField} />
      {/* sidebar cart start */}
      <SidebarCart openCart={openCart} setOpenCart={setOpenCart} />
      {/* sidebar cart end */}
      {/* sidebar mobile menu */}
      <SidebarMenu />
    </>
  );
};

export default MainHeader;
