'use client';

import React, { useEffect, useState } from 'react';
import { Spin, Empty } from 'antd';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import { useTranslations } from 'next-intl';
import { Course } from '@/services/courseService';
import {
  getCourseGroupEnrollmentDetail,
  CourseGroupEnrollmentDetail,
  EnrollmentCourseResponse,
} from '@/services/enrollService';
import CommonCourseSingleCard from '@/components/common/course-card/CommonCourseSingleCard';
import { COURSE_VIEW_MODE } from '@/constants';
import Image from 'next/image';
import styles from './CourseProgramLesson.module.scss';

interface ProgramLessonProps {
  courseId: number;
  enrollmentId?: number;
}

const CourseProgramLesson: React.FC<ProgramLessonProps> = ({ courseId, enrollmentId }) => {
  const t = useTranslations('CourseProgramLesson');
  const [groupCourse, setGroupCourse] = useState<CourseGroupEnrollmentDetail | null>(null);
  const [courses, setCourses] = useState<EnrollmentCourseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupCourseAndCourses = async () => {
      try {
        setLoading(true);
        // Use enrollmentId if available, otherwise use courseId
        const fetchId = courseId;
        // Fetch group course enrollment detail
        const groupCourseData = await getCourseGroupEnrollmentDetail(fetchId);
        setGroupCourse(groupCourseData);

        // Extract courses from enrollment_course_responses
        const coursesList = groupCourseData.enrollment_course_responses || [];
        setCourses(coursesList);
      } catch (error) {
        console.error('Error fetching group course:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (courseId || enrollmentId) {
      fetchGroupCourseAndCourses();
    }
  }, [courseId, enrollmentId]);

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('breadcrumbProgramLesson')} />

      <section className={styles.courseProgramLesson}>
        <div className="container custom-container">
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
            </div>
          ) : courses.length === 0 ? (
            <Empty description={t('empty')} style={{ padding: '60px 0' }} />
          ) : (
            <>
              {/* Group Course Header */}
              {groupCourse && (
                <div className={styles.groupCourseHeader}>
                  {/* Thumbnail */}
                  <div className={styles.thumbnail}>
                    {groupCourse.course_group_thumbnail ? (
                      <Image
                        src={groupCourse.course_group_thumbnail}
                        alt={groupCourse.course_group_title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.noImagePlaceholder}>{t('noImage')}</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.infoSection}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '28px' }}>
                      {groupCourse.course_group_title}
                    </h2>
                    <p className={styles.description}>{groupCourse.course_group_description}</p>

                    {/* What you will learn */}
                    {groupCourse.what_you_learn && (
                      <div className={styles.whatYouLearnSection}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500 }}>
                          {t('whatYouLearn')}
                        </p>
                        <p
                          style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}
                        >
                          {groupCourse.what_you_learn}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className={styles.statsSection}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                          {t('courses')}
                        </p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                          {courses.length}
                        </p>
                      </div>
                      {groupCourse.enrollment_type && (
                        <div>
                          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>
                            {t('type')}
                          </p>
                          <p style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                            {t('lifetime')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Courses Grid - 3 per row */}
              <div style={{ marginTop: '50px' }}>
                <h3 style={{ marginBottom: '30px', fontSize: '24px' }}>{t('coursesInProgram')}</h3>
                <div className="row g-30">
                  {courses.map(course => (
                    <div className="col-xl-4 col-lg-4 col-md-6" key={course.id}>
                      <CommonCourseSingleCard
                        course={
                          {
                            id: course.course_id,
                            title: course.title,
                            slug: course.slug,
                            thumbnail: course.thumbnail,
                            course_type: course.course_type,
                            total_progress: course.total_progress,
                          } as any
                        }
                        enrollmentId={enrollmentId}
                        viewMode={COURSE_VIEW_MODE.STUDENT}
                        isEnrolled={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default CourseProgramLesson;
