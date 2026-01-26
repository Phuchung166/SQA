import InstructorDetailsMain from '@/components/pages/Instructor/Instructor-details/InstructorDetailsMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
  title: 'Instructor Details - Education & Online Courses React NextJs Template',
};

const InstructorDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  return (
    <>
      <ClientWrapper>
        <main>
          <InstructorDetailsMain slug={slug} />
        </main>
      </ClientWrapper>
    </>
  );
};

export default InstructorDetails;
