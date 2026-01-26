import CourseLessonWrapper from '@/components/wrappers/CourseLessonWrapper';
import { getEnrollments } from '@/services/enrollService';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Course Lesson - Education & Online Courses React NextJs Template',
};

interface CourseProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ enrollmentId?: string }>;
}

const CourseLesson = async ({ params, searchParams }: CourseProps) => {
  const { id } = await params;
  const courseId = parseInt(id, 10);
  const searchParamsObj = await searchParams;
  let enrollmentId: number | undefined;

  // Try to get enrollmentId from query params first
  if (searchParamsObj?.enrollmentId) {
    enrollmentId = parseInt(searchParamsObj.enrollmentId, 10);
  } else {
    // If not provided, fetch the enrollment for this course from the current user
    try {
      const response = await getEnrollments({
        page: 1,
        pageSize: 1,
        courseId: courseId,
      });

      if (response.data && response.data.length > 0) {
        enrollmentId = response.data[0].id;
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      // Continue without enrollmentId - it's optional
    }
  }

  return (
    <>
      <main>
        <CourseLessonWrapper courseId={courseId} enrollmentId={enrollmentId} />
      </main>
    </>
  );
};

export default CourseLesson;
