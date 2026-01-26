import CoursesFilterCategoryMain from '@/components/courses-inner-pages/courses-filter-category/CoursesFilterCategoryMain';
import categoryService, { Category } from '@/services/categoryService';
import { Course, getCourses, GroupCourse, getGroupCourses } from '@/services/courseService';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';
import { COURSE_STATUS } from '@/constants';

export const metadata: Metadata = {
  title: 'Online Learning',
  description:
    'Explore our extensive range of online courses and educational resources. Filter by category to find the perfect course for your learning needs. Join us today and start your journey towards knowledge and skill enhancement.',
  keywords:
    'online courses, app development, learning, skill enhancement, education,mobile app development, AI tools, project-based learning',
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const categoryId = parseInt((resolvedSearchParams?.category as string) || '0');
  const courseType = (resolvedSearchParams?.type as string) || ''; // 'group' or 'independent'
  const { categorySlug } = resolvedParams;

  let courses: Course[] = [];
  let groupCourses: GroupCourse[] = [];
  let categories: Category[] = [];
  let fetchError: string | null = null;
  let hasTypeParam = !!courseType;

  try {
    // Always fetch categories
    const responseCategories = await categoryService.getCategories({
      page: 1,
      pageSize: 10,
      isActive: true,
    });

    if (responseCategories && responseCategories.data) {
      categories = responseCategories.data;
    }

    // Case 1: Has type param - fetch specific course type by category
    if (hasTypeParam) {
      if (courseType === 'group') {
        // Fetch group courses by category
        const response = await getGroupCourses({
          page: 1,
          pageSize: 100,
          ...(categoryId !== -1 && categoryId !== 0 ? { categoryId: String(categoryId) } : {}),
        });
        groupCourses = response.data || [];
      } else {
        // Fetch independent courses by category
        const response = await getCourses({
          page: 1,
          pageSize: 100,
          ...(categoryId !== -1 && categoryId !== 0 ? { categoryId: String(categoryId) } : {}),
        });
        courses = response.data?.filter(c => c.status === COURSE_STATUS.ACTIVE) || [];
      }
    }
    // Case 2: No type param - fetch both for carousel display
    else {
      const [coursesResponse, groupCoursesResponse] = await Promise.all([
        getCourses({
          page: 1,
          pageSize: 10,
          ...(categoryId !== -1 && categoryId !== 0 ? { categoryId: String(categoryId) } : {}),
        }),
        getGroupCourses({
          page: 1,
          pageSize: 10,
          ...(categoryId !== -1 && categoryId !== 0 ? { categoryId: String(categoryId) } : {}),
        }),
      ]);

      if (coursesResponse && coursesResponse.data) {
        courses = coursesResponse.data?.filter(c => c.status === COURSE_STATUS.ACTIVE) || [];
      }
      if (groupCoursesResponse && groupCoursesResponse.data) {
        groupCourses = groupCoursesResponse.data || [];
      }
    }
  } catch (error) {
    console.error('Error fetching courses by category:', error);
    courses = [];
    groupCourses = [];
    categories = [];
    fetchError =
      (error instanceof Error && error.message) || String(error) || 'Failed to fetch data';
  }

  return (
    <ClientWrapper>
      <main>
        <CoursesFilterCategoryMain
          courses={courses}
          groupCourses={groupCourses}
          categoryId={categoryId}
          categories={categories}
          categorySlug={categorySlug}
          fetchError={fetchError}
          hasTypeParam={hasTypeParam}
          courseType={courseType}
        />
      </main>
    </ClientWrapper>
  );
}
