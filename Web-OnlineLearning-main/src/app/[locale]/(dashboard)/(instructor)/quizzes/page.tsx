'use client';

import React from 'react';
import QuizzesList from '@/components/quiz/QuizzesList';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

const InstructorQuizzesPage: React.FC = () => {
  return (
    <ClientWrapper>
      <QuizzesList />
    </ClientWrapper>
  );
};

export default InstructorQuizzesPage;
