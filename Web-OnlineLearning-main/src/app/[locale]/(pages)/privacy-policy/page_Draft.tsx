import PrivacyPolicyMain from '@/components/pages/privacy-policy/PrivacyPolicyMain';
import { Metadata } from 'next';
import React from 'react';

import dynamic from 'next/dynamic';
const Wrapper = dynamic(() => import('@/layout/DefaultWrapper'), {
  ssr: false, // Tắt SSR hoàn toàn cho Wrapper
});

export const metadata: Metadata = {
  title: 'Privacy And Policy - Education & Online Courses React NextJs Template',
};

const PrivacyPolicy = () => {
  return (
    <>
      <Wrapper>
        <main>
          <PrivacyPolicyMain />
        </main>
      </Wrapper>
    </>
  );
};

export default PrivacyPolicy;
