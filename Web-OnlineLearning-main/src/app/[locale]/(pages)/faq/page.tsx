import FaqMain from '@/components/pages/faq/FaqMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Faq - Education & Online Courses React NextJs Template',
};

const Faq = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <FaqMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default Faq;
