'use client';

import React from 'react';
import DefaultWrapper from '@/layout/DefaultWrapper';
import TakeQuiz from '@/components/quiz/TakeQuiz';

interface QuizAttemptPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

const QuizAttemptPage: React.FC<QuizAttemptPageProps> = ({ params }) => {
  const [quizId, setQuizId] = React.useState<number | null>(null);

  React.useEffect(() => {
    params.then((p) => {
      setQuizId(parseInt(p.quizId, 10));
    });
  }, [params]);

  if (!quizId) {
    return (
      <DefaultWrapper>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </DefaultWrapper>
    );
  }

  return (
    <DefaultWrapper>
      <TakeQuiz quizId={quizId} />
    </DefaultWrapper>
  );
};

export default QuizAttemptPage;
