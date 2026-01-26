import InstructorAnalyticsMain from '@/components/dashboard/instructor/instructor-analytics/InstructorAnalyticsMain';
import InstructorDashboardLayout from '@/layout/InstructorDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Instructor Analytics - Education & Online Courses React NextJs Template',
};

const InstructorAnalytics = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <InstructorDashboardLayout>
            <InstructorAnalyticsMain />
          </InstructorDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default InstructorAnalytics;
