import PurchaseHistoryMain from '@/components/dashboard/student/purchase-history/PurchaseHistoryMain';
import StudentDashboardLayout from '@/layout/StudentDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Student Purchase History - Education & Online Courses React NextJs Template',
};

const StudentPurchaseHistory = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <StudentDashboardLayout>
            <PurchaseHistoryMain />
          </StudentDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default StudentPurchaseHistory;
