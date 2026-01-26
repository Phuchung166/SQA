import InstructorMyQuizMain from '@/components/dashboard/instructor/instructor-my-quiz/InstructorMyQuizMain';
import InstructorDashboardLayout from '@/layout/InstructorDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Instructor Quiz Attempts - Education & Online Courses React NextJs Template',
};

const InstructorMyQuiz = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <InstructorDashboardLayout>
            <InstructorMyQuizMain />
          </InstructorDashboardLayout>
        </main>
      </ClientWrapper>
    </>
  );
};

export default InstructorMyQuiz;
