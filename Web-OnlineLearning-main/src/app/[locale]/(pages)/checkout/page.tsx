import CheckoutMain from '@/components/pages/checkout/CheckoutMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Checkout - Education & Online Courses React NextJs Template',
};

const Checkout = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <CheckoutMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default Checkout;
