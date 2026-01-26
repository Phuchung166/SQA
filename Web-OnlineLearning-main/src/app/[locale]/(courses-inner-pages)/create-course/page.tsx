import CreateCourseMain from '@/components/courses-inner-pages/create-course/CreateCourseMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Create New Courses - Education & Online Courses React NextJs Template',
};

const CreateCourse = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <CreateCourseMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default CreateCourse;
