import InstructorMainArea from '@/components/pages/Instructor/InstructorMainArea';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';
export const metadata: Metadata = {
  title: 'Instructor - Education & Online Courses React NextJs Template',
};

const Instructor = () => {
  return (
    <>
      <ClientWrapper>
        <main>
          <InstructorMainArea />
        </main>
      </ClientWrapper>
    </>
  );
};

export default Instructor;
