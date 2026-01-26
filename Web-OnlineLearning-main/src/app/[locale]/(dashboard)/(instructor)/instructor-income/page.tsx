import InstructorIncomeMain from '@/components/dashboard/instructor/instructor-income/InstructorIncomeMain';
import InstructorDashboardLayout from '@/layout/InstructorDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Instructor Purchase History - Education & Online Courses React NextJs Template',
};

const InstructorIncome = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <InstructorDashboardLayout>
            <InstructorIncomeMain />
          </InstructorDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default InstructorIncome;
