import CourseProgramMain from '@/components/courses-inner-pages/course-program/CourseProgramMain';
import { getGroupCourseById, GroupCourse } from '@/services/courseService';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { courseId } = await props.params;
  const id = Number(courseId);

  let course: GroupCourse | undefined = undefined;
  try {
    course = await getGroupCourseById(id);
  } catch {
    course = undefined;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const title = course?.title || 'Course Program - Education & Online Courses';
  const description =
    course?.description?.substring(0, 160) ||
    'Explore our comprehensive course programs. Learn from expert instructors with structured curriculum.';
  const image = course?.thumbnail || '/assets/images/default-course.jpg';

  return {
    title: `${title} | Online Learning Platform`,
    description,
    keywords: [
      'group course',
      'course program',
      'education',
      course?.title || 'course',
      'structured learning',
      'online education',
    ],
    openGraph: {
      title: `${title} | Online Learning Platform`,
      description,
      type: 'website',
      url: `${baseUrl}/course-program/${id}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Online Learning Platform`,
      description,
      images: [image],
    },
  };
}

interface PageProps {
  params: Promise<{ courseId: string }>;
}

const CourseProgramPage = async (props: PageProps) => {
  const { courseId } = await props.params;
  const id = Number(courseId);

  let course: GroupCourse | undefined = undefined;
  try {
    course = await getGroupCourseById(id);
  } catch {
    course = undefined;
  }

  return (
    <>
      <ClientWrapper>
        <main>
          <CourseProgramMain initialGroupCourse={course} groupCourseId={id} />
        </main>
      </ClientWrapper>
    </>
  );
};

export default CourseProgramPage;
