'';
import OnlineCourseMain from '@/components/online-course/OnlineCourseMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';
export const metadata: Metadata = {
  title: 'Android Coding with AI',
};

const OnlineCourse = () => {
  return (
    <>
      <ClientWrapper>
        <main className="main-area">
          <OnlineCourseMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default OnlineCourse;
