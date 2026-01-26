import MyQuizMain from '@/components/dashboard/student/my-quiz/MyQuizMain';
import StudentDashboardLayout from '@/layout/StudentDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Student My Quiz - Education & Online Courses React NextJs Template',
};

const StudentMyQuiz = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <StudentDashboardLayout>
            <MyQuizMain />
          </StudentDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default StudentMyQuiz;
