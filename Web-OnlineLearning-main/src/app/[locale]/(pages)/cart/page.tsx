import CartMain from '@/components/pages/cart/CartMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Cart - Education & Online Courses React NextJs Template',
};

const Cart = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <CartMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default Cart;
