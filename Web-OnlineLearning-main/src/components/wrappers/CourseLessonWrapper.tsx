'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const CoursesLessonMain = dynamic(
  () => import('@/components/courses-inner-pages/course-lesson/CoursesLessonMain'),
  {
    ssr: false,
  },
);

interface ClientWrapperProps {
  courseId: number;
  enrollmentId?: number;
}

export const CourseLessonWrapper: React.FC<ClientWrapperProps> = ({ courseId, enrollmentId }) => {
  return <CoursesLessonMain courseId={courseId} enrollmentId={enrollmentId} />;
};

export default CourseLessonWrapper;
