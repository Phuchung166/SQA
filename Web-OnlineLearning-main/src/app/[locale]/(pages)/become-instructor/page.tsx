import BecomeInstructorMain from '@/components/pages/become-instructor/BecomeInstructorMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Become Instructor - Education & Online Courses React NextJs Template',
};

const BecomeInstructor = () => {
  return (
    <ClientWrapper>
      <main>
        <BecomeInstructorMain />
      </main>
    </ClientWrapper>
  );
};

export default BecomeInstructor;
