import CourseFilterSearchMain from '@/components/courses-inner-pages/courses-filter-search/CourseFilterSearchMain';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
    title: "Search Filter - Education & Online Courses React NextJs Template",
};

const CourseFilterSearch = () => {
    return (
        <>
            <ClientWrapper>
                <main>
                    <CourseFilterSearchMain />
                </main>
            </ClientWrapper>
        </>
    );
};

export default CourseFilterSearch;