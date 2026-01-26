import React from 'react';
import PreOrderCallbackMain from '@/components/pages/pre-orders/PreOrderCallbackMain';
import { Metadata } from 'next';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Pre-Order Callback | Online Learning',
  description: 'Pre-order payment callback and reservation status',
};

export default function PreOrderCallbackPage() {
  return (
    <ClientWrapper>
      <PreOrderCallbackMain />
    </ClientWrapper>
  );
}
