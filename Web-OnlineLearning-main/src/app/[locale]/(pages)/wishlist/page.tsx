import WishlistMain from '@/components/pages/wishlist/WishlistMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Wishlist - Education & Online Courses React NextJs Template',
};

const Wishlist = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <WishlistMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default Wishlist;
