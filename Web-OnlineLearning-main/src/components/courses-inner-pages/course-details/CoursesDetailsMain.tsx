'use client';
import Breadcrumbs from '@/components/common/Breadcrumb/Breadcrumbs';
import { Course } from '@/services/courseService';
import Image from 'next/image';
import React, { useState, memo, useEffect, useRef } from 'react';
import avatarImg from '../../../../public/assets/images/avatar/avatar.webp';
import Link from 'next/link';
import CourseWillYouLearn from './CourseWillYouLearn';
import CourseRequirements from './CourseRequirements';
import CourseCurriculum from './CourseCurriculum';
import DetailsInstructor from './DetailsInstructor';
import StudentFeedback from './StudentFeedback';
import CourseDetailsReviews from './CourseDetalisReviews';
import CourseSidebarWidget from './CourseSidebarWidget';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { wishlist_product } from '@/redux/slices/wishlistSlice';
import { checkEnroll } from '@/services/enrollService';
import { RootState } from '@/redux/store';
import { USER_ROLES } from '@/constants';

const CoursesDetailsMain = ({
  initialCourse,
  courseId,
  subCourseId: _subCourseId,
}: {
  initialCourse?: Course | null;
  courseId: number;
  subCourseId?: number;
}) => {
  // unified client-side course state. Initialized from server-provided initialCourse when available
  const t = useTranslations('CourseDetails');
  const dispatch = useAppDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [_refreshReviews, _setRefreshReviews] = useState(false);
  const [_isEnrolled, setIsEnrolled] = useState(false);
  const [_checkingEnrollment, setCheckingEnrollment] = useState(false);
  const enrollmentId = useRef<number | null>(null);

  // Get auth state
  const isLoggedIn = useAppSelector((state: RootState) => state.auth.isLoggedIn);
  const userRoles = useAppSelector((state: RootState) => state.auth.user?.roles);

  // Check enrollment status when component mounts
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      // Only check if user is logged in and is student or instructor
      if (!isLoggedIn || !initialCourse?.id) {
        return;
      }

      // Only check for student and instructor roles
      const hasStudentOrInstructorRole = userRoles?.some(
        role => role === USER_ROLES.STUDENT || role === USER_ROLES.INSTRUCTOR,
      );

      if (!hasStudentOrInstructorRole) {
        return;
      }

      try {
        setCheckingEnrollment(true);
        const response = await checkEnroll(
          initialCourse.id,
          'STANDALONE',
          initialCourse.is_pre_order || false,
        );
        enrollmentId.current = response.enrollmentId || 0;
        const isEnrolledCourse = initialCourse.is_pre_order
          ? response.hasPreOrder || false
          : response.isEnrolled;
        setIsEnrolled(isEnrolledCourse);
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollmentStatus();
  }, [isLoggedIn, userRoles, initialCourse?.id]);

  const handleAddToWishlist = (courseData: Course) => {
    if (courseData) {
      dispatch(wishlist_product(courseData));
      setIsWishlisted(!isWishlisted);
    }
  };

  // Helper function to render rating stars
  const renderRatingStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map(star => {
      let starClass = 'fal fa-star'; // empty star

      if (rating >= star) {
        starClass = 'fas fa-star'; // full star
      } else if (rating > star - 1) {
        starClass = 'fas fa-star-half-alt'; // half star
      }

      return (
        <li key={star}>
          <i className={starClass}></i>
        </li>
      );
    });
  };

  return (
    <>
      <Breadcrumbs breadcrumbTitle={t('breadcrumbTitle')} />
      {/* -- course details area start -- */}
      <section className="bd-course-details-area bd-course-details-top section-space-bottom">
        <div className="container">
          <div className="row gy-30">
            <div className="col-xxl-8 col-xl-8 col-lg-8">
              <div className="bd-course-details-wrapper mb-30">
                <div className="bd-course-details-heading mb-30">
                  <div className="d-flex align-items-center justify-content-between mb--5">
                    <h2 className="bd-course-details-title mb-0">{initialCourse?.title}</h2>
                    <button
                      onClick={() => handleAddToWishlist(initialCourse!)}
                      className="bd-wishlist-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '24px',
                        color: isWishlisted ? '#e74c3c' : '#999',
                        transition: 'color 0.3s ease',
                      }}
                      title="Add to wishlist"
                    >
                      <i className={isWishlisted ? 'fas fa-heart' : 'far fa-heart'}></i>
                    </button>
                  </div>
                  {!initialCourse?.is_pre_order && (
                    <div className="bd-course-details-rating rating-spacing">
                      <ul>{renderRatingStars(initialCourse?.review?.avg_rating || 0)}</ul>
                      <span>
                        ({(initialCourse?.review?.avg_rating || 0).toFixed(1)}){' '}
                        {initialCourse?.review?.total_reviews || 0} {t('reviews')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bd-course-details-meta mb-30">
                  <div className="bd-course-author border-line-meta">
                    <div className="thumb">
                      <Link
                        href={`/instructor/instructor-details/${initialCourse?.instructor?.slug}`}
                      >
                        {initialCourse?.instructor?.avatar ? (
                          <Image
                            src={initialCourse.instructor.avatar}
                            alt="author"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <Image src={avatarImg || ''} alt="author" width={40} height={40} />
                        )}
                      </Link>
                    </div>
                    <div className="authour-meta">
                      <span className="subtitle">{t('createdBy')}</span>
                      <div className="name">
                        <Link
                          href={`/instructor/instructor-details/${initialCourse?.instructor?.slug}`}
                        >
                          {initialCourse?.instructor?.first_name +
                            ' ' +
                            initialCourse?.instructor?.last_name || 'Unknown Instructor'}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="bd-course-details-meta-item border-line-meta">
                    <p className="title">{t('totalEnrolled')}</p>
                    <span className="subtitle">{initialCourse?.total_students || 0}</span>
                  </div>
                  <div className="bd-course-details-meta-item border-line-meta">
                    <p className="title">{t('publishedAt')}</p>
                    <span className="subtitle">
                      {(() => {
                        const raw = initialCourse?.published_at;
                        if (!raw) return 'Unknown Date';
                        try {
                          const d = new Date(raw);
                          if (isNaN(d.getTime())) return 'Unknown Date';
                          // Format as day/month/year for Vietnamese locale (e.g. 31/10/2025)
                          return d.toLocaleDateString('vi-VN');
                        } catch {
                          return 'Unknown Date';
                        }
                      })()}
                    </span>
                  </div>
                  <div className="bd-course-details-meta-item">
                    <p className="title">{t('category')}</p>
                    <span className="subtitle">
                      <Link href="#">{initialCourse?.category?.name || 'General'}</Link>
                    </span>
                  </div>
                </div>
                <div className="bd-course-details-content mb-30">
                  <h3 className="bd-course-details-content-title">{t('description')}</h3>
                  <div
                    className="description"
                    dangerouslySetInnerHTML={{ __html: initialCourse?.description || '' }}
                  ></div>
                </div>
                <CourseWillYouLearn course={initialCourse!} loading={false} />
                <CourseRequirements course={initialCourse!} loading={false} />
                {/* Show curriculum */}
                <CourseCurriculum course={initialCourse!} loading={false} />
                {initialCourse?.instructor ? (
                  <DetailsInstructor instructor={initialCourse.instructor} />
                ) : null}
                {/* Student Feedback */}
                {initialCourse?.is_pre_order ? (
                  <></>
                ) : (
                  <>
                    <StudentFeedback courseId={initialCourse?.id} />

                    <CourseDetailsReviews courseId={initialCourse?.id} />
                  </>
                )}
              </div>
            </div>
            <div className="col-xxl-4 col-xl-4 col-lg-4">
              <CourseSidebarWidget
                course={initialCourse!}
                loading={false}
                courseId={initialCourse?.id || courseId}
                isEnrolled={_isEnrolled}
                checkingEnrollment={_checkingEnrollment}
                enrollmentId={enrollmentId.current}
              />
            </div>
          </div>
        </div>
      </section>
      {/* -- course details area end -- */}
    </>
  );
};

export default memo(CoursesDetailsMain);
