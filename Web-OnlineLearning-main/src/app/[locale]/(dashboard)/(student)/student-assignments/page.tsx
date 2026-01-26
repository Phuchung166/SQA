import StudentAssignmentMain from '@/components/dashboard/student/assignment/StudentAssignmentMain';
import StudentDashboardLayout from '@/layout/StudentDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Student Assignment - Education & Online Courses React NextJs Template',
};

const StudentAssignment = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <StudentDashboardLayout>
            <StudentAssignmentMain />
          </StudentDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default StudentAssignment;
