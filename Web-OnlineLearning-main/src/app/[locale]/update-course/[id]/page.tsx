import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import UpdateCourseMain from '@/components/courses-inner-pages/update-course/UpdateCourseMain';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'instructorDashboard' });

  return {
    title: t('updateCourse.pageTitle'),
    description: t('updateCourse.pageDescription'),
  };
}

interface UpdateCoursePageProps {
  params: Promise<{ locale: string; id: string }>;
}

const UpdateCoursePage = async ({ params }: UpdateCoursePageProps) => {
  const { id } = await params;
  const courseId = parseInt(id, 10);

  if (isNaN(courseId)) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>Invalid Course ID</h2>
        <p>The course ID provided is not valid.</p>
      </div>
    );
  }

  return (
    <ClientWrapper>
      <main>
        <UpdateCourseMain courseId={courseId} />
      </main>
    </ClientWrapper>
  );
};

export default UpdateCoursePage;
