import CoursesDetailsMain from '@/components/courses-inner-pages/course-details/CoursesDetailsMain';
import { getCourseById, Course } from '@/services/courseService';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { courseId } = await (props.params || Promise.resolve({ courseId: '' }));
  const id = Number(courseId);

  let course: Course | null = null;
  try {
    course = await getCourseById(id);
  } catch {
    course = null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const title = course?.title || 'Course Details - Education & Online Courses';
  const description =
    course?.description?.substring(0, 160) ||
    'Learn from expert instructors. Explore our comprehensive online courses and expand your skills.';
  const image = course?.thumbnail || '/assets/images/default-course.jpg';

  return {
    title: `${title} | Online Learning Platform`,
    description,
    keywords: [
      'online course',
      'education',
      course?.title || 'course',
      course?.category?.name || 'learning',
      'skill development',
    ],
    openGraph: {
      title: `${title} | Online Learning Platform`,
      description,
      type: 'website',
      url: `${baseUrl}/course-details/${id}`,
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
  params?: Promise<{ courseId: string }>;
  // Next's generated types expect searchParams to be a Promise<any> in some builds;
  // make this a Promise of the expected shape and await it below.
  searchParams?: Promise<{ subCourseId?: string }>;
}

const CourseDetails = async (props: PageProps) => {
  // In Next.js app router, `params` come from path segments and `searchParams` from the query string.
  const { courseId } = await (props.params || Promise.resolve({ courseId: '' }));
  const rawSearchParams = (await (props.searchParams || Promise.resolve(undefined))) || {};
  const id = Number(courseId);
  const subId = rawSearchParams.subCourseId ? Number(rawSearchParams.subCourseId) : undefined;
  console.log('CourseDetails pageId:', id, ' subId:', subId);

  let _course: Course | null = null;
  try {
    _course = await getCourseById(id);
  } catch {
    _course = null;
  }

  return (
    <>
      <ClientWrapper>
        <main>
          <CoursesDetailsMain initialCourse={_course} courseId={id} />
        </main>
      </ClientWrapper>
    </>
  );
};

export default CourseDetails;
