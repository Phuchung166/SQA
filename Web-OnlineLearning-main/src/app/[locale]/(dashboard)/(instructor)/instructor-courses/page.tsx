import InstructorCoursesMain from '@/components/dashboard/instructor/instructor-courses/InstructorCoursesMain';
import InstructorDashboardLayout from '@/layout/InstructorDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Instructor Courses - Education & Online Courses React NextJs Template',
};

const InstructorCourses = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <InstructorDashboardLayout>
            <InstructorCoursesMain />
          </InstructorDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default InstructorCourses;
