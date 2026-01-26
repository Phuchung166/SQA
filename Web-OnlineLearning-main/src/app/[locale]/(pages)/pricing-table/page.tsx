import PricingTableMain from '@/components/pages/pricing-table/PricingTableMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Pricing Table - Education & Online Courses React NextJs Template',
};

const PricingPage = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <PricingTableMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default PricingPage;
