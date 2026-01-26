import PreOrderCoursesMain from '@/components/courses-inner-pages/pre-order-courses/PreOrderCoursesMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Pre-Order Courses - Hot Deals | Education & Online Courses',
  description:
    'Get exclusive early access to new courses at discounted prices. Limited slots available!',
};

const PreOrderCoursesPage = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <PreOrderCoursesMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default PreOrderCoursesPage;
