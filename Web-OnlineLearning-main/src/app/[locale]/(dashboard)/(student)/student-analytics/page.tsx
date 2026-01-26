import StudentDashboardAnalytics from '@/components/dashboard/student/analytics/StudentDashboardAnalytics';
import StudentDashboardLayout from '@/layout/StudentDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Student Analytics - Education & Online Courses React NextJs Template',
};

const StudentAnalytics = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <StudentDashboardLayout>
            <StudentDashboardAnalytics />
          </StudentDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default StudentAnalytics;
