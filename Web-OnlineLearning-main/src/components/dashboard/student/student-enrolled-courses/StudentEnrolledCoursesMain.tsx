'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useNotification } from '@/hooks/useMessage';
import '../../instructor/instructor-courses/styles.scss';
import {
  getUserCourses,
  getUserCourseGroups,
  getMyPaidPreOrderCourses,
  UserCourseEnrollment,
  UserCourseGroupEnrollment,
  MyPaidPreOrderCourse,
} from '@/services/enrollService';
import CommonCourseSingleCard from '@/components/common/course-card/CommonCourseSingleCard';
import { GroupCourseCard } from '@/components/common/group-course-card';
import { COURSE_VIEW_MODE } from '@/constants';
import { Spin, Pagination, Empty, Tabs } from 'antd';

const StudentEnrolledCoursesMain = () => {
  // Independent courses state
  const [independentEnrollments, setIndependentEnrollments] = useState<UserCourseEnrollment[]>([]);
  const [independentLoading, setIndependentLoading] = useState(true);
  const [independentCurrentPage, setIndependentCurrentPage] = useState(1);
  const [independentTotal, setIndependentTotal] = useState(0);

  // Group courses state
  const [groupEnrollments, setGroupEnrollments] = useState<UserCourseGroupEnrollment[]>([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupCurrentPage, setGroupCurrentPage] = useState(1);
  const [groupTotal, setGroupTotal] = useState(0);

  // Pre-order courses state
  const [preOrderEnrollments, setPreOrderEnrollments] = useState<MyPaidPreOrderCourse[]>([]);
  const [preOrderLoading, setPreOrderLoading] = useState(true);
  const [preOrderCurrentPage, setPreOrderCurrentPage] = useState(1);
  const [preOrderTotal, setPreOrderTotal] = useState(0);

  const pageSize = 6;
  const tNotif = useTranslations('notification');
  const t = useTranslations('instructorDashboard');
  const notification = useNotification();

  const extractErrorMessage = (error: unknown): string | undefined => {
    if (!error) return undefined;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null) {
      const maybe = error as { message?: unknown; response?: { data?: { message?: unknown } } };
      if (
        maybe.response &&
        maybe.response.data &&
        typeof maybe.response.data.message === 'string'
      ) {
        return maybe.response.data.message as string;
      }
      if (typeof maybe.message === 'string') return maybe.message as string;
    }
    return undefined;
  };

  // Fetch independent and group enrollments
  const fetchEnrollments = useCallback(async () => {
    try {
      setIndependentLoading(true);
      setGroupLoading(true);
      setPreOrderLoading(true);

      // Fetch independent/standalone courses from new endpoint
      const independentResponse = await getUserCourses({
        page: independentCurrentPage,
        pageSize,
      });

      setIndependentEnrollments(independentResponse.data || []);
      setIndependentTotal(independentResponse.total_elements || 0);

      // Fetch group courses from new endpoint
      const groupResponse = await getUserCourseGroups({
        page: groupCurrentPage,
        pageSize,
      });

      setGroupEnrollments(groupResponse.data || []);
      setGroupTotal(groupResponse.total_elements || 0);

      // Fetch pre-order enrollments
      const preOrderResponse = await getMyPaidPreOrderCourses({
        page: preOrderCurrentPage,
        pageSize,
      });

      setPreOrderEnrollments(preOrderResponse.data || []);
      setPreOrderTotal(preOrderResponse.total_elements || 0);
    } catch (error) {
      const errMsg = extractErrorMessage(error) || 'Failed to load enrolled courses';
      notification.error({
        message: tNotif ? tNotif('error') : 'Error',
        description: errMsg,
        placement: 'topRight',
        duration: 3,
      });
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setIndependentLoading(false);
      setGroupLoading(false);
      setPreOrderLoading(false);
    }
  }, [independentCurrentPage, groupCurrentPage, preOrderCurrentPage]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Handle page changes
  const handleIndependentPageChange = (page: number) => {
    setIndependentCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGroupPageChange = (page: number) => {
    setGroupCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreOrderPageChange = (page: number) => {
    setPreOrderCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get status badge for pre-order
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      RESERVED: 'badge-success',
      PENDING: 'badge-warning',
      COMPLETED: 'badge-primary',
      CANCELLED: 'badge-danger',
    };
    return statusColors[status] || 'badge-secondary';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Render independent courses tab
  const renderIndependentCoursesTab = () => (
    <div className="dashboard-enrolled-courses">
      {independentLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : independentEnrollments.length === 0 ? (
        <Empty description={t('noIndependentCourses')} style={{ padding: '60px 0' }} />
      ) : (
        <>
          <div className="row g-30">
            {independentEnrollments.map(enrollment => {
              // Convert UserCourseEnrollment to Course object for CommonCourseSingleCard
              const courseData: any = {
                id: enrollment.course_id,
                title: enrollment.title,
                slug: enrollment.slug,
                thumbnail: enrollment.thumbnail,
                course_type: enrollment.course_type,
                total_progress: enrollment.total_progress, // Progress percentage (0-100)
                // Add minimal required fields for the component
                price: 0,
                original_price: 0,
                currency: 'VND',
                is_free: true,
                level: 'beginner',
                language: 'vi',
                status: 'published',
              };

              return (
                <div className="col-xl-6 col-lg-6 col-md-12" key={enrollment.id}>
                  <CommonCourseSingleCard
                    course={courseData}
                    viewMode={COURSE_VIEW_MODE.STUDENT}
                    isEnrolled={true}
                    enrollmentId={enrollment.id}
                  />
                </div>
              );
            })}
          </div>

          {independentTotal > pageSize && (
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Pagination
                current={independentCurrentPage}
                total={independentTotal}
                pageSize={pageSize}
                onChange={handleIndependentPageChange}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} ${t('independentCourses')}`
                }
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
      ) : groupEnrollments.length === 0 ? (
        <Empty description={t('noGroupCourses')} style={{ padding: '60px 0' }} />
      ) : (
        <>
          <div className="row g-30">
            {groupEnrollments.map(enrollment => {
              // Convert UserCourseGroupEnrollment to GroupCourse object for GroupCourseCard
              const groupCourseData: any = {
                id: enrollment.course_id,
                title: enrollment.title,
                slug: enrollment.slug,
                thumbnail: enrollment.thumbnail,
                course_type: enrollment.course_type,
                total_progress: enrollment.total_progress, // Progress percentage (0-100)
                // Add minimal required fields for the component
                price: 0,
                currency: 'VND',
                enrollment_type: 'LIFETIME',
                description: '',
                whatYouLearn: '',
                list_of_courses: [],
              };

              return (
                <div className="col-xl-6 col-lg-6 col-md-12" key={enrollment.id}>
                  <GroupCourseCard
                    groupCourse={groupCourseData}
                    viewMode={COURSE_VIEW_MODE.STUDENT}
                    enrollmentId={enrollment.id}
                  />
                </div>
              );
            })}
          </div>

          {groupTotal > pageSize && (
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Pagination
                current={groupCurrentPage}
                total={groupTotal}
                pageSize={pageSize}
                onChange={handleGroupPageChange}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} ${t('groupCourses')}`
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render pre-order courses tab
  const renderPreOrderCoursesTab = () => (
    <div className="dashboard-enrolled-courses">
      {preOrderLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : preOrderEnrollments.length === 0 ? (
        <Empty description={t('noPreOrderCourses')} style={{ padding: '60px 0' }} />
      ) : (
        <>
          <div className="row g-30">
            {preOrderEnrollments.map((enrollment, index) => (
              <div className="col-xl-6 col-lg-6 col-md-12" key={`${enrollment.course_id}-${index}`}>
                <div className="bd-pre-order-card">
                  <div className="bd-pre-order-card-thumb">
                    <img src={enrollment.course_thumbnail} alt={enrollment.course_title} />
                  </div>
                  <div className="bd-pre-order-card-content">
                    <h5 className="bd-pre-order-card-title">
                      <a href={`/course-details/${enrollment.course_id}`}>
                        {enrollment.course_title}
                      </a>
                    </h5>
                    <div className="bd-pre-order-card-meta">
                      <div className="bd-pre-order-card-info">
                        <span className="bd-pre-order-label">{t('slotNumber')}:</span>
                        <span className="bd-pre-order-value">#{enrollment.slot_number}</span>
                      </div>
                      <div className="bd-pre-order-card-info">
                        <span className="bd-pre-order-label">{t('pricePaid')}:</span>
                        <span className="bd-pre-order-value">
                          {formatCurrency(enrollment.price_paid)}
                        </span>
                      </div>
                      <div className="bd-pre-order-card-info">
                        <span className="bd-pre-order-label">{t('preOrderDate')}:</span>
                        <span className="bd-pre-order-value">
                          {new Date(enrollment.pre_order_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="bd-pre-order-card-info">
                        <span className="bd-pre-order-label">{t('status')}:</span>
                        <span className={`badge ${getStatusBadge(enrollment.status)}`}>
                          {t(`preOrderStatus.${enrollment.status.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {preOrderTotal > pageSize && (
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Pagination
                current={preOrderCurrentPage}
                total={preOrderTotal}
                pageSize={pageSize}
                onChange={handlePreOrderPageChange}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} ${t('preOrderCourses')}`
                }
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
    {
      key: 'preorder',
      label: t('preOrderCourses'),
      children: renderPreOrderCoursesTab(),
    },
  ];

  return (
    <>
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <div className="bd-dashboard-title-inner">
            <h4 className="bd-dashboard-title">{t('enrolledCourses')}</h4>
          </div>

          <Tabs items={tabItems} defaultActiveKey="independent" className="bd-dashboard-tabs" />
        </div>
      </div>
    </>
  );
};

export default StudentEnrolledCoursesMain;
