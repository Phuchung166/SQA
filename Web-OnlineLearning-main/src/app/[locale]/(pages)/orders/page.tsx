import OrderCallbackMain from '@/components/pages/orders/OrderCallbackMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Order Payment - Education & Online Courses React NextJs Template',
};

const OrderCallback = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <OrderCallbackMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default OrderCallback;
