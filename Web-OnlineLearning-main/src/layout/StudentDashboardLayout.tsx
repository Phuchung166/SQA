import React, { ReactNode } from 'react';
import DashboardSidebarMenu from './sidebar/DashboardSidebarMenu';
import StudentDashboardBreadcrumb from '@/components/common/Breadcrumb/StudentDashboardBreadcrumb';
import { UserProfile } from '@/services/userService';

interface DashboardLayoutProps {
  children: ReactNode;
  profile?: UserProfile | null;
}

const StudentDashboardLayout: React.FC<DashboardLayoutProps> = ({ children, profile }) => {
  return (
    <>
      <StudentDashboardBreadcrumb profile={profile} />
      {/* -- Start student Dashboard Area -- */}
      <div className="bd-dashboard-area section-space-bottom">
        <div className="container">
          <div className="bd-dashboard-main">
            <div className="row gy-30">
              <DashboardSidebarMenu profile={profile} />
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboardLayout;
