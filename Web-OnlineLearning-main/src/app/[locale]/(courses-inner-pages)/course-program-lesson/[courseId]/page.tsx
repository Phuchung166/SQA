import CourseProgramLesson from '@/components/courses-inner-pages/course-program-lesson/CourseProgramLesson';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Course Program - Education & Online Courses React NextJs Template',
};

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ enrollmentId?: string }>;
}

const CourseProgramPage = async (props: PageProps) => {
  const { courseId } = await props.params;
  const { enrollmentId } = await props.searchParams;
  const id = Number(courseId) || 0;
  const enrollId = enrollmentId ? Number(enrollmentId) : undefined;

  return (
    <>
      <ClientWrapper>
        <main>
          <CourseProgramLesson courseId={id} enrollmentId={enrollId} />
        </main>
      </ClientWrapper>
    </>
  );
};

export default CourseProgramPage;
