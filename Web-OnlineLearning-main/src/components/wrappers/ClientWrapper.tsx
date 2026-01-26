'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Wrapper = dynamic(() => import('@/layout/DefaultWrapper'), {
  ssr: false,
});

interface ClientWrapperProps {
  children: React.ReactNode;
}

export const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

export default ClientWrapper;
