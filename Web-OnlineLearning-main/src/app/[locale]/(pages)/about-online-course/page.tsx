import AboutOnlineCourseMain from '@/components/pages/about-online-course/AboutOnlineCourseMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'About Online Course - Education & Online Courses React NextJs Template',
};

const AboutOnlineCourse = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <AboutOnlineCourseMain />
        </main>
      </ClientWrapper>
    </>
  );
};

export default AboutOnlineCourse;
