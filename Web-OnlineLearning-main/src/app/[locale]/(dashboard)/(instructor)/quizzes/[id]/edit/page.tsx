'use client';

import QuizUpdateForm from '@/components/dashboard/instructor/instructor-my-quiz/QuizUpdateForm';
import ClientWrapper from '@/components/wrappers/ClientWrapper';
import React, { use } from 'react';

interface EditQuizPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

const EditQuizPage = ({ params }: EditQuizPageProps) => {
  const { id, locale } = use(params);
  const quizId = parseInt(id, 10);

  return (
    <ClientWrapper>
      <QuizUpdateForm quizId={quizId} locale={locale} />
    </ClientWrapper>
  );
};

export default EditQuizPage;
