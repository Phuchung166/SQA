'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import GetRating from '../GetRating';
import { Course, publishCourse } from '@/services/courseService';
import { calculateDiscountPercent, formatCurrency } from '@/utils/HelperUtils';
import { useTranslations } from 'next-intl';
import { COURSE_TYPE, COURSE_VIEW_MODE, type CourseViewMode } from '@/constants';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addCartItem } from '@/redux/slices/cartSlice';
import { selectIsLoggedIn } from '@/redux/slices/authSlice';
import { ProgressBar } from '../progress-bar';
import { useCountdown } from '@/hooks/useCountdown';
import { Tooltip } from 'antd';

import './styles.scss';
import { useNotification } from '@/hooks/useMessage';

interface coursePropsType {
  course: Course;
  // View mode props
  viewMode?: CourseViewMode;
  // Callback functions for instructor actions
  onUpdate?: (courseId: number) => void;
  onDelete?: (courseId: number) => void;
  // Optional: Check if student is enrolled
  isEnrolled?: boolean;
  // Optional: Enrollment ID for lesson page
  enrollmentId?: number;
}

const CommonCourseSingleCard = ({
  course,
  viewMode = COURSE_VIEW_MODE.DEFAULT,
  onUpdate,
  onDelete,
  isEnrolled = false,
  enrollmentId,
}: coursePropsType) => {
  const notification = useNotification();
  const t = useTranslations('OnlineCourse');
  const tStatus = useTranslations('courseStatus');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const [isAdding, setIsAdding] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState<string | undefined>(course.status);
  const countdown = useCountdown(course.pre_order_end_date);
  const [ripples, setRipples] = useState<number[]>([]);

  // Check if course has students enrolled
  const hasEnrolledStudents = (course.total_students ?? 0) > 0;
  // Check if course is active (reserved for future use)
  const _isActive = course.status === 'ACTIVE';
  const navigateToCourse = async (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    try {
      const rawType = (course as any)?.course_type || (course as any)?.type || null;

      if (rawType === COURSE_TYPE.PROGRAM || rawType === COURSE_TYPE.SPECIALIZATION) {
        router.push(`/course-program/${course.id}`);
        return;
      }

      router.push(`/course-details/${course.id}`);
      return;
    } catch {
      router.push(`/`);
    }
  };
  return (
    <>
      <div className="bd-course-wrapper style-two">
        <Link
          href="#"
          onClick={e => navigateToCourse(e, course)}
          className="bd-course-thumb-wrapper bd-course-thumb-style p-relative"
        >
          {course.is_pre_order ? (
            <div className="bd-preorder-bar">
              <div className="bd-preorder-bar-item hot-deal">
                <i className="fas fa-fire"></i>
                <span>{t('hotDeal')}</span>
              </div>
              <div className="bd-preorder-bar-item slots">
                <span>
                  {t('slots')}: {course.pre_order_remaining_slots}/{course.pre_order_total_slots}
                </span>
              </div>
              {!countdown.isExpired && (
                <div className="bd-preorder-bar-item countdown">
                  <span>
                    {countdown.days}
                    {t('day')} {countdown.hours}
                    {t('hour')} {countdown.minutes}
                    {t('minute')}
                    {countdown.days === 0 && (
                      <>
                        {' '}
                        {countdown.seconds}
                        {t('second')}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bd-course-badge">
              <span className={`bd-badge badge-warning`}>
                {calculateDiscountPercent(course.price, course.price) + '% Off'}
              </span>
            </div>
          )}

          <div className={`bd-course-thumb-bg bg-1`}>
            <Image src={course.thumbnail} alt="images" width={40} height={40} />
          </div>

          {/* {RenderTextContent(course)} */}
        </Link>

        {/* Floating Add to Cart button (top-right) */}
        {viewMode === COURSE_VIEW_MODE.DEFAULT && !course.is_pre_order && (
          <button
            aria-label={t('addToCart')}
            title={
              !isLoggedIn
                ? t('pleaseLogin')
                : isAdding
                  ? ((t('added') as string) ?? 'Added')
                  : (t('addToCart') as string)
            }
            onClick={async () => {
              // Check authentication first
              if (!isLoggedIn) {
                notification.error({
                  message: t('pleaseLogin'),
                  description: t('loginToAddToCart'),
                });
                router.push('/auth/login');
                return;
              }

              if (isAdding) return;
              // create ripple id
              const id = Date.now();
              setRipples(s => [...s, id]);
              try {
                setIsAdding(true);
                dispatch(addCartItem(course.id));
              } finally {
                // remove ripple after animation
                setTimeout(() => setRipples(s => s.filter(r => r !== id)), 600);
                setTimeout(() => setIsAdding(false), 900);
              }
            }}
            type="button"
            disabled={!isLoggedIn}
            className={`bd-cart-floating ${isAdding ? 'active' : ''}`}
          >
            <i className={isAdding ? 'fa-solid fa-check' : 'fa-solid fa-cart-plus'} />

            {/* Ripple elements */}
            <span className="bd-cart-ripple-container">
              {ripples.map(r => (
                <span key={r} className="bd-cart-ripple" />
              ))}
            </span>
          </button>
        )}
        <div className="bd-course-content">
          {/* Progress bar for enrolled students - at top of content */}
          {viewMode === COURSE_VIEW_MODE.STUDENT &&
            (course as any)?.total_progress !== undefined && (
              <div className="progress-bar-container">
                <ProgressBar progress={(course as any).total_progress} />
              </div>
            )}

          {viewMode === COURSE_VIEW_MODE.DEFAULT && (
            <div className="bd-course-meta d-flex-between mb-15">
              <div className="bd-course-tag">
                <Link className="bd-badge badge-outline-light badge-transparent" href="#">
                  {course.category?.name}
                </Link>
              </div>
              <div className="bd-course-lesson">
                <span>
                  <i className="fa-light fa-book"></i>
                  {course.total_lessons || 0} {' ' + t('lessons')}
                </span>
              </div>
            </div>
          )}
          <h5 className="bd-course-title underline mb-10">
            <Link href="#" onClick={e => navigateToCourse(e, course)}>
              {course.title}
            </Link>
          </h5>
          <div className="bd-course-rating d-flex-between">
            <div className="bd-course-price">
              {course.is_pre_order ? (
                <>
                  <span className="current-price preorder-price">
                    {formatCurrency(course.pre_order_price || 0) + ' ' + course.currency}
                  </span>
                  <span className="old-price">
                    {formatCurrency(course.price) + ' ' + course.currency}
                  </span>
                </>
              ) : (
                <span className="current-price">
                  {formatCurrency(course.price) + ' ' + course.currency}
                </span>
              )}
            </div>

            <div className="bd-course-rating-wrap d-flex align-items-center gap-10">
              <div className="bd-course-rating-icon fs-14 d-flex rating-color">
                <GetRating averageRating={course.avg_rating || 0} />
              </div>
              <div className="bd-course-rating-text">
                <span>
                  {course.avg_rating || 0} ({course.total_reviews || 0})
                </span>
              </div>
            </div>
          </div>
          <div className="bd-course-full-border"></div>
          <div>
            <div className="btn-wrap flex-wrap d-flex align-items-center justify-content-between">
              {viewMode === COURSE_VIEW_MODE.INSTRUCTOR && (
                <div className="instructor-status-display">
                  <div className="status-label">
                    {tStatus('status')}:{' '}
                    <span className="status-value">{t(course?.status || 'unknown')}</span>
                  </div>
                </div>
              )}
              {viewMode === COURSE_VIEW_MODE.DEFAULT && (
                <div className="bd-course-author">
                  <div className="thumb">
                    {course.instructor?.avatar && (
                      <Image src={course.instructor?.avatar} alt="author" width={40} height={40} />
                    )}
                  </div>
                  <div className="name">
                    <Link href="/instructor/instructor-details">
                      {course.instructor?.first_name} {course.instructor?.last_name}
                    </Link>
                  </div>
                </div>
              )}

              {/* Default view - Enroll Now button */}
              {viewMode === COURSE_VIEW_MODE.DEFAULT && (
                <div className="bd-course-btn">
                  <div className="course-action-buttons">
                    <Link
                      className="bd-text-btn"
                      href="#"
                      onClick={e => navigateToCourse(e, course)}
                    >
                      <p className="course-action-text">{t('enrollNow')}</p>
                      <span className="box-icon">
                        <i className="fa-regular fa-arrow-right-long first-icon"></i>
                        <i className="fa-regular fa-arrow-right-long second-icon"></i>
                      </span>
                    </Link>
                    {/* preserved spacing for layout; add-to-cart is now floating */}
                  </div>
                </div>
              )}

              {/* Student view - Go to Course button */}
              {viewMode === COURSE_VIEW_MODE.STUDENT && (
                <div className="bd-course-btn">
                  <Link
                    className="bd-text-btn"
                    href="#"
                    onClick={async e => {
                      e.preventDefault();
                      try {
                        const rawType =
                          (course as any)?.course_type || (course as any)?.type || null;
                        let url = '';
                        if (
                          rawType === COURSE_TYPE.PROGRAM ||
                          rawType === COURSE_TYPE.SPECIALIZATION
                        ) {
                          url = `/course-program-lesson/${course.id}`;
                        } else {
                          url = `/course-lesson/${course.id}`;
                        }

                        // Add enrollmentId to query params if available
                        if (enrollmentId) {
                          url += `?enrollmentId=${enrollmentId}`;
                        }

                        router.push(url);
                      } catch {
                        router.push(`/course-lesson/${course.id}`);
                      }
                    }}
                  >
                    <p style={{ marginBottom: 0, color: '#000', fontWeight: 500 }}>
                      {isEnrolled ? t('goToCourse') : t('enrollNow')}
                    </p>
                    <span className="box-icon">
                      <i className="fa-regular fa-arrow-right-long first-icon"></i>
                      <i className="fa-regular fa-arrow-right-long second-icon"></i>
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Instructor view - Update & Delete buttons */}
            {viewMode === COURSE_VIEW_MODE.INSTRUCTOR && (
              <div
                className=" d-flex gap-5 align-items-center justify-content-between"
                style={{ width: '100%' }}
              >
                <button
                  className="bd-text-btn custom-btn-course"
                  onClick={() => onUpdate && onUpdate(course.id)}
                  type="button"
                >
                  {t('update')}
                  <span className="box-icon">
                    <i className="fa-regular fa-pen-to-square first-icon"></i>
                    <i className="fa-regular fa-pen-to-square second-icon"></i>
                  </span>
                </button>
                {/* Publish button - only shown when not published and not active */}
                {status !== 'PUBLISHED' && status !== 'ACTIVE' && (
                  <button
                    className="bd-text-btn custom-btn-course"
                    onClick={async () => {
                      if (isPublishing) return;
                      setIsPublishing(true);
                      try {
                        await publishCourse(course.id);
                        setStatus('PUBLISHED');
                        notification.success({
                          message: t('coursePublished'),
                          description: t('coursePublishedDesc'),
                        });
                        if (onUpdate) onUpdate(course.id);
                      } catch (err: any) {
                        notification.error({
                          message: t('publishFailed'),
                          description: err?.message || String(err) || t('publishFailed'),
                        });
                      } finally {
                        setIsPublishing(false);
                      }
                    }}
                    type="button"
                    disabled={isPublishing}
                  >
                    {isPublishing ? t('publishing') : t('publish')}
                    <span className="box-icon">
                      <i className="fa-regular fa-upload first-icon"></i>
                      <i className="fa-regular fa-upload second-icon"></i>
                    </span>
                  </button>
                )}
                <Tooltip
                  title={
                    hasEnrolledStudents
                      ? t('cannotDeleteCourseDesc', { count: course.total_students || 0 })
                      : ''
                  }
                >
                  <button
                    className="bd-text-btn text-danger custom-btn-course"
                    onClick={() => {
                      if (hasEnrolledStudents) {
                        notification.error({
                          message: t('cannotDeleteCourse'),
                          description: t('cannotDeleteCourseDesc', {
                            count: course.total_students || 0,
                          }),
                        });
                        return;
                      }
                      if (onDelete) {
                        onDelete(course.id);
                      }
                    }}
                    type="button"
                    disabled={hasEnrolledStudents}
                  >
                    {t('delete')}
                    <span className="box-icon">
                      <i className="fa-regular fa-trash first-icon"></i>
                      <i className="fa-regular fa-trash second-icon"></i>
                    </span>
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Ripple keyframes and helper styles for button ripple effect */}
      <style>{`@keyframes bd-ripple { from { transform: translate(-50%, -50%) scale(0); opacity: 0.6 } to { transform: translate(-50%, -50%) scale(3.2); opacity: 0 } }
        .bd-cart-ripple { will-change: transform, opacity; }
      `}</style>
    </>
  );
};

export default CommonCourseSingleCard;
