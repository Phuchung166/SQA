//@refresh

import { Metadata } from 'next';
//import Script from "next/script";
import React from 'react';
import OnlineCourseMain from '@/components/online-course/OnlineCourseMain';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Online Learning',
};

const Home = () => {
  return (
    <>
      <ClientWrapper>
        <main className="main-area">
          <OnlineCourseMain />
        </main>
      </ClientWrapper>

      {/* Adsterra Social Bar script hidden
        <Script
          id="adsterra-social-bar"
          strategy="afterInteractive"
          src="//pl26850584.profitableratecpm.com/8f/88/2b/8f882b070aa288aa986892f6ee6b951d.js"
        />
        */}
    </>
  );
};

export default Home;
