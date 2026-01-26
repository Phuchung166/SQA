'use client';

import React from 'react';
import QuizList from './QuizList';
import { useAppSelector } from '@/redux/hooks';
import { selectUser } from '@/redux/slices/authSlice';

const InstructorMyQuizMain: React.FC = () => {
  // Get instructor ID from Redux user
  const user = useAppSelector(selectUser);
  const instructorId = user?.id || 1; // Replace with actual user ID

  return <QuizList instructorId={instructorId} />;
};

export default InstructorMyQuizMain;
