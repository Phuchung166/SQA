import InstructorProfileMain from '@/components/dashboard/instructor/instructor-profile/InstructorProfileMain';
import InstructorDashboardLayout from '@/layout/InstructorDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Instructor Profile - Education & Online Courses React NextJs Template',
};

const InstructorProfile = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <InstructorDashboardLayout>
            <InstructorProfileMain />
          </InstructorDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default InstructorProfile;
