import StudentOrdersMain from '@/components/dashboard/student/orders/StudentOrdersMain';
import StudentDashboardLayout from '@/layout/StudentDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'My Orders - Education & Online Courses React NextJs Template',
};

const StudentOrders = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <StudentDashboardLayout>
            <StudentOrdersMain />
          </StudentDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default StudentOrders;
