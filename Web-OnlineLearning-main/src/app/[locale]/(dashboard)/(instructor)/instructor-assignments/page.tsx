import InstructorAssignmentsMain from '@/components/dashboard/instructor/instructor-assignments/InstructorAssignmentsMain';
import InstructorDashboardLayout from '@/layout/InstructorDashboardLayout';
import { Metadata } from 'next';
import React from 'react';
import ClientWrapper from '@/components/wrappers/ClientWrapper';

export const metadata: Metadata = {
    title: "Instructor Assignments - Education & Online Courses React NextJs Template",
};

const InstructorAssignment = () => {
    return (
        <>
            <ClientWrapper>
                <main>
                    <InstructorDashboardLayout>
                        <InstructorAssignmentsMain />
                    </InstructorDashboardLayout>
                </main>
            </ClientWrapper>
        </>
    );
};

export default InstructorAssignment;