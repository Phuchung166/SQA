'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Spin, Pagination, Empty, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/hooks/useMessage';
import {
  getInstructorCourses,
  deleteCourse,
  Course,
  getGroupCoursesInstructor,
  GroupCourse,
  deleteGroupCourse,
} from '@/services/courseService';
import CommonCourseSingleCard from '@/components/common/course-card/CommonCourseSingleCard';
import { GroupCourseCard } from '@/components/common/group-course-card';
import { COURSE_VIEW_MODE } from '@/constants';
import { showDangerConfirmModal } from '@/components/common/modals';
import './styles.scss';

const InstructorCoursesMain = () => {
  // Regular courses state
  const [independentCourses, setIndependentCourses] = useState<Course[]>([]);
  const [independentLoading, setIndependentLoading] = useState(true);
  const [independentCurrentPage, setIndependentCurrentPage] = useState(1);
  const [independentTotalCourses, setIndependentTotalCourses] = useState(0);

  // Group courses state
  const [groupCourses, setGroupCourses] = useState<GroupCourse[]>([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupCurrentPage, setGroupCurrentPage] = useState(1);
  const [groupTotalCourses, setGroupTotalCourses] = useState(0);

  const pageSize = 6;

  const router = useRouter();
  const t = useTranslations('instructorDashboard');
  const tNotif = useTranslations('notification');
  const notification = useNotification();

  // Fetch independent courses
  const fetchIndependentCourses = useCallback(async () => {
    try {
      setIndependentLoading(true);
      const response = await getInstructorCourses({
        page: independentCurrentPage,
        pageSize: pageSize,
      });
      setIndependentCourses(response.data?.filter(c => !c.is_pre_order) || []);
      setIndependentTotalCourses(response.total_elements);
    } catch (error: unknown) {
      console.error('Error fetching independent courses:', error);
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to load your courses. Please try again.';
      notification.error({
        message: tNotif('error'),
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setIndependentLoading(false);
    }
  }, [independentCurrentPage]);

  // Fetch group courses
  const fetchGroupCourses = useCallback(async () => {
    try {
      setGroupLoading(true);
      const response = await getGroupCoursesInstructor({
        page: groupCurrentPage,
        pageSize: pageSize,
      });
      setGroupCourses(response.data?.filter(gc => !gc.is_pre_order) || []);
      setGroupTotalCourses(response.total_elements);
    } catch (error: unknown) {
      console.error('Error fetching group courses:', error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Failed to load your group courses. Please try again.';
      notification.error({
        message: tNotif('error'),
        description: errorMsg,
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setGroupLoading(false);
    }
  }, [groupCurrentPage]);

  // Fetch both on mount and page changes
  useEffect(() => {
    fetchIndependentCourses();
  }, [fetchIndependentCourses]);

  useEffect(() => {
    fetchGroupCourses();
  }, [fetchGroupCourses]);

  // Handle page changes
  const handleIndependentPageChange = (page: number) => {
    setIndependentCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGroupPageChange = (page: number) => {
    setGroupCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update handlers
  const handleUpdateIndependentCourse = (courseId: number) => {
    router.push(`/update-course/${courseId}`);
  };

  const handleUpdateGroupCourse = (groupCourseId: number) => {
    router.push(`/update-group-course/${groupCourseId}`);
  };

  // Delete handlers
  const handleDeleteIndependentCourse = (courseId: number) => {
    const courseToDelete = independentCourses.find(c => c.id === courseId);

    showDangerConfirmModal({
      title: t('deleteCourseTitle'),
      content: t('deleteCourseConfirm', { courseName: courseToDelete?.title || 'this course' }),
      okText: t('confirmDelete'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await deleteCourse(courseId);

          notification.success({
            message: tNotif('success'),
            description: t('deleteCourseSuccess'),
            placement: 'topRight',
            duration: 3,
          });

          // Refresh the course list
          fetchIndependentCourses();
        } catch (error: unknown) {
          console.error('Error deleting course:', error);
          const errorMsg = error instanceof Error ? error.message : t('deleteCourseError');

          notification.error({
            message: tNotif('error'),
            description: errorMsg,
            placement: 'topRight',
            duration: 5,
          });
        }
      },
    });
  };

  const handleDeleteGroupCourse = (groupCourseId: number) => {
    const courseToDelete = groupCourses.find(c => c.id === groupCourseId);

    showDangerConfirmModal({
      title: t('deleteCourseTitle'),
      content: t('deleteCourseConfirm', { courseName: courseToDelete?.title || 'this course' }),
      okText: t('confirmDelete'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await deleteGroupCourse(groupCourseId);

          notification.success({
            message: tNotif('success'),
            description: t('deleteCourseSuccess'),
            placement: 'topRight',
            duration: 3,
          });

          // Refresh the course list
          fetchGroupCourses();
        } catch (error: unknown) {
          console.error('Error deleting group course:', error);
          const errorMsg = error instanceof Error ? error.message : t('deleteCourseError');

          notification.error({
            message: tNotif('error'),
            description: errorMsg,
            placement: 'topRight',
            duration: 5,
          });
        }
      },
    });
  };

  // Render independent courses tab
  const renderIndependentCoursesTab = () => (
    <div className="dashboard-enrolled-courses">
      {independentLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : independentCourses.length === 0 ? (
        <Empty description={t('noIndependentCourses')} style={{ padding: '60px 0' }} />
      ) : (
        <>
          <div className="row g-30">
            {independentCourses.map(course => (
              <div className="col-xl-6 col-lg-6 col-md-12" key={course.id}>
                <CommonCourseSingleCard
                  course={course}
                  viewMode={COURSE_VIEW_MODE.INSTRUCTOR}
                  onUpdate={handleUpdateIndependentCourse}
                  onDelete={handleDeleteIndependentCourse}
                />
              </div>
            ))}
          </div>

          {independentTotalCourses > pageSize && (
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Pagination
                current={independentCurrentPage}
                total={independentTotalCourses}
                pageSize={pageSize}
                onChange={handleIndependentPageChange}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} courses`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render group courses tab
  const renderGroupCoursesTab = () => (
    <div className="dashboard-enrolled-courses">
      {groupLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : groupCourses.length === 0 ? (
        <Empty description={t('noGroupCourses')} style={{ padding: '60px 0' }} />
      ) : (
        <>
          <div className="row g-30">
            {groupCourses.map(course => (
              <div className="col-xl-6 col-lg-6 col-md-12" key={course.id}>
                <GroupCourseCard
                  groupCourse={course}
                  viewMode={COURSE_VIEW_MODE.INSTRUCTOR}
                  onUpdate={handleUpdateGroupCourse}
                  onDelete={handleDeleteGroupCourse}
                />
              </div>
            ))}
          </div>

          {groupTotalCourses > pageSize && (
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Pagination
                current={groupCurrentPage}
                total={groupTotalCourses}
                pageSize={pageSize}
                onChange={handleGroupPageChange}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} courses`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'independent',
      label: t('independentCourses'),
      children: renderIndependentCoursesTab(),
    },
    {
      key: 'group',
      label: t('groupCourses'),
      children: renderGroupCoursesTab(),
    },
  ];

  return (
    <>
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <div className="bd-dashboard-title-inner">
            <h4 className="bd-dashboard-title">{t('myCourses')}</h4>
          </div>

          <Tabs items={tabItems} defaultActiveKey="independent" className="bd-dashboard-tabs" />
        </div>
      </div>
    </>
  );
};

export default InstructorCoursesMain;
