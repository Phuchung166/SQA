import StudentProfileWrapper from '@/components/dashboard/student/student-profile/StudentProfileWrapper';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Student Profile - Education & Online Courses React NextJs Template',
};

const StudentProfile = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <StudentProfileWrapper />
        </main>
      </ClientWrapper>
    </>
  );
};

export default StudentProfile;
