import StudentEnrolledCoursesMain from '@/components/dashboard/student/student-enrolled-courses/StudentEnrolledCoursesMain';
import StudentDashboardLayout from '@/layout/StudentDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Student Enrolled Courses - Education & Online Courses React NextJs Template',
};

const StudentEnrolledCourses = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <StudentDashboardLayout>
            <StudentEnrolledCoursesMain />
          </StudentDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default StudentEnrolledCourses;
