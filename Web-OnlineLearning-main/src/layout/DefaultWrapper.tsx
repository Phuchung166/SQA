'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BacktoTop from '@/utils/BacktoTop';
import MainHeader from './header/MainHeader';
import Preloader from '@/components/common/preloader/Preloader';
import WOW from 'wow.js';
import MainFooter from './footer/MainFooter';

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load Bootstrap JS only on the client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('bootstrap/dist/js/bootstrap.bundle.min')
        .then(() => console.log('Bootstrap loaded'))
        .catch(err => console.error('Bootstrap failed to load', err));
    }
  }, []);

  // Set the loading state to false after a timeout
  useEffect(() => {
    const loadingTimeout = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(loadingTimeout);
  }, []);

  // Initialize WOW.js animations on the client
  useEffect(() => {
    const wow = new WOW({
      boxClass: 'wow',
      animateClass: 'animated',
      offset: 0,
      mobile: true,
      live: true,
    });
    wow.init();
  }, []);

  return (
    <>
      <BacktoTop />
      <MainHeader />
      {isLoading ? <Preloader /> : children}
      <MainFooter />
    </>
  );
};

export default Wrapper;
