import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import UpdateGroupCourseMain from '@/components/courses-inner-pages/update-group-course/UpdateGroupCourseMain';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'instructorDashboard' });

  return {
    title: t('updateGroupCourse.pageTitle') || 'Update Group Course',
    description: t('updateGroupCourse.pageDescription') || 'Update group course details',
  };
}

interface UpdateGroupCoursePageProps {
  params: Promise<{ locale: string; id: string }>;
}

const UpdateGroupCoursePage = async ({ params }: UpdateGroupCoursePageProps) => {
  const { id } = await params;
  const groupCourseId = parseInt(id, 10);

  if (isNaN(groupCourseId)) {
    return (
      <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2>Invalid Group Course ID</h2>
        <p>The group course ID provided is not valid.</p>
      </div>
    );
  }

  return (
    <ClientWrapper>
      <main>
        <UpdateGroupCourseMain groupCourseId={groupCourseId} />
      </main>
    </ClientWrapper>
  );
};

export default UpdateGroupCoursePage;
