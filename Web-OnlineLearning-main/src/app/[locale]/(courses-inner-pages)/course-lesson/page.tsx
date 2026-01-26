import CourseLessonWrapper from '@/components/wrappers/CourseLessonWrapper';
import { getEnrollments } from '@/services/enrollService';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Course Lesson - Education & Online Courses React NextJs Template',
};

interface CourseProps {
  searchParams: Promise<{ courseId?: string; enrollmentId?: string }>;
}

const CourseLesson = async ({ searchParams }: CourseProps) => {
  const params = await searchParams;
  const courseId = params.courseId ? parseInt(params.courseId, 10) : 0;
  let enrollmentId: number | undefined;

  // Try to get enrollmentId from query params first
  if (params.enrollmentId) {
    enrollmentId = parseInt(params.enrollmentId, 10);
  } else if (courseId) {
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
