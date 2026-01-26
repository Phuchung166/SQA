'use client';

import React from 'react';
import CreateUpdateQuiz from '@/components/quiz/CreateUpdateQuiz';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

interface CreateQuizPageProps {
  searchParams: Promise<{
    quizId?: string;
  }>;
}

export default async function CreateQuizPage({ searchParams }: CreateQuizPageProps) {
  const params = await searchParams;
  const quizId = params.quizId ? parseInt(params.quizId) : undefined;

  return (
    <ClientWrapper>
      <CreateUpdateQuiz quizId={quizId} />
    </ClientWrapper>
  );
}
