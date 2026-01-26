'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import GetRating from '../GetRating';
import { GroupCourse, publishCourse } from '@/services/courseService';
import { calculateDiscountPercent, encodeUrl, formatCurrency } from '@/utils/HelperUtils';
import { useTranslations } from 'next-intl';
import { COURSE_TYPE, COURSE_VIEW_MODE, type CourseViewMode } from '@/constants';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addGroupCartItem } from '@/redux/slices/cartSlice';
import { selectIsLoggedIn } from '@/redux/slices/authSlice';
import { useNotification } from '@/hooks/useMessage';
import { ProgressBar } from '../progress-bar';
import './../course-card/styles.scss';

interface GroupCourseCardPropsType {
  groupCourse: GroupCourse;
  // View mode props
  viewMode?: CourseViewMode;
  // Callback functions for instructor actions
  onUpdate?: (groupCourseId: number) => void;
  onDelete?: (groupCourseId: number) => void;
  // Optional: Check if student is enrolled
  isEnrolled?: boolean;
  // Optional: Enrollment ID for lesson page
  enrollmentId?: number;
}

const GroupCourseCard = ({
  groupCourse,
  viewMode = COURSE_VIEW_MODE.DEFAULT,
  onUpdate,
  onDelete,
  isEnrolled = false,
  enrollmentId,
}: GroupCourseCardPropsType) => {
  const t = useTranslations('OnlineCourse');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const notification = useNotification();
  const [isAdding, setIsAdding] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);
  const navigateToGroupCourse = async (e: React.MouseEvent, groupCourse: GroupCourse) => {
    e.preventDefault();
    try {
      // Group course doesn't have type distinction, navigate to course-program view
      router.push(`/course-program/${groupCourse.id}`);
      return;
    } catch {
      router.push(`/`);
    }
  };
  return (
    <>
      <div className="bd-course-wrapper style-two" style={{ position: 'relative' }}>
        <Link
          href="#"
          onClick={e => navigateToGroupCourse(e, groupCourse)}
          className="bd-course-thumb-wrapper bd-course-thumb-style p-relative"
        >
          <div className="bd-course-badge">
            <span className={`bd-badge badge-warning`}>
              {calculateDiscountPercent(groupCourse.price || 0, groupCourse.price || 0) + '% Off'}
            </span>
          </div>

          <div className={`bd-course-thumb-bg bg-1`}>
            <Image src={groupCourse.thumbnail} alt="images" width={40} height={40} />
          </div>

          {/* {RenderTextContent(groupCourse)} */}
        </Link>

        {/* Floating Add to Cart button (top-right) */}
        {viewMode === COURSE_VIEW_MODE.DEFAULT && (
          <button
            aria-label={t('addToCart')}
            title={
              !isLoggedIn
                ? 'Please log in to add to cart'
                : isAdding
                  ? ((t('added') as string) ?? 'Added')
                  : (t('addToCart') as string)
            }
            onClick={async () => {
              // Check authentication first
              if (!isLoggedIn) {
                notification.error({
                  message: 'Please log in',
                  description: 'You need to log in to add courses to cart.',
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
                dispatch(addGroupCartItem(groupCourse.id));
              } finally {
                // remove ripple after animation
                setTimeout(() => setRipples(s => s.filter(r => r !== id)), 600);
                setTimeout(() => setIsAdding(false), 900);
              }
            }}
            type="button"
            disabled={!isLoggedIn}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 20,
              borderRadius: '50%',
              padding: 10,
              background: !isLoggedIn ? '#ccc' : isAdding ? '#0d6efd' : '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: !isLoggedIn
                ? '0 2px 6px rgba(0,0,0,0.1)'
                : isAdding
                  ? '0 8px 18px rgba(13,110,253,0.25)'
                  : '0 6px 14px rgba(25, 25, 25, 0.08)',
              cursor: !isLoggedIn ? 'not-allowed' : isAdding ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: !isLoggedIn ? 'scale(1)' : isAdding ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 200ms ease, box-shadow 200ms ease, background 200ms ease',
              opacity: !isLoggedIn ? 0.6 : 1,
            }}
            className="bd-cart-floating"
          >
            <i
              className={isAdding ? 'fa-solid fa-check' : 'fa-solid fa-cart-plus'}
              style={{ fontSize: 16, color: isAdding ? '#fff' : '#333', transition: 'color 200ms' }}
            />

            {/* Ripple elements */}
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                overflow: 'visible',
                pointerEvents: 'none',
              }}
            >
              {ripples.map(r => (
                <span
                  key={r}
                  className="bd-cart-ripple"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: 8,
                    height: 8,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: isAdding ? 'rgba(255,255,255,0.45)' : 'rgba(13,110,253,0.18)',
                    animation: 'bd-ripple 600ms ease-out',
                  }}
                />
              ))}
            </span>
          </button>
        )}
        <div className="bd-course-content">
          {/* Progress bar for enrolled students - at top of content */}
          {viewMode === COURSE_VIEW_MODE.STUDENT &&
            (groupCourse as any)?.total_progress !== undefined && (
              <div style={{ marginBottom: '15px' }}>
                <ProgressBar progress={(groupCourse as any).total_progress} />
              </div>
            )}

          <div className="bd-course-meta d-flex-between mb-15">
            <div className="bd-course-tag">
              <Link
                className="bd-badge badge-outline-light badge-transparent"
                href={`/courses-filter-category/${encodeUrl(groupCourse.category?.name || '')}?category=${groupCourse.category?.id}`}
              >
                {groupCourse.category?.name || t('unknown')}
              </Link>
            </div>
            <div className="bd-course-lesson">
              <span>
                <i className="fa-light fa-book"></i>
                {groupCourse.total_courses || 0} {t('courses')}
              </span>
            </div>
          </div>
          <h5 className="bd-course-title underline mb-10">
            <Link href="#" onClick={e => navigateToGroupCourse(e, groupCourse)}>
              {groupCourse.title}
            </Link>
          </h5>
          <div className="bd-course-rating d-flex-between">
            <div className="bd-course-price">
              <span className="current-price">
                {formatCurrency(groupCourse.price || 0) + ' ' + groupCourse.currency || 'USD'}
              </span>
            </div>
          </div>
          <div className="bd-course-full-border"></div>

          <div className="btn-wrap flex-wrap d-flex align-items-center justify-content-between">
            {/* Default view - Enroll Now button */}
            {viewMode === COURSE_VIEW_MODE.DEFAULT && (
              <div className="d-flex-between w-100">
                <div className="bd-course-author">
                  <div className="thumb">
                    {groupCourse.instructor?.avatar && (
                      <Image
                        src={
                          groupCourse.instructor.avatar ||
                          '/assets/images/instructor/avatar_default.jfif'
                        }
                        alt="author"
                        width={40}
                        height={40}
                      />
                    )}
                  </div>
                  <div className="name">
                    <Link href="#">
                      {groupCourse.instructor?.first_name} {groupCourse.instructor?.last_name}
                    </Link>
                  </div>
                </div>
                <div className="bd-course-btn">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link
                      className="bd-text-btn"
                      href="#"
                      onClick={e => navigateToGroupCourse(e, groupCourse)}
                    >
                      <p style={{ marginBottom: 0, color: '#000', fontWeight: 500 }}>
                        {t('enrollNow')}
                      </p>
                      <span className="box-icon">
                        <i className="fa-regular fa-arrow-right-long first-icon"></i>
                        <i className="fa-regular fa-arrow-right-long second-icon"></i>
                      </span>
                    </Link>
                    {/* preserved spacing for layout; add-to-cart is now floating */}
                  </div>
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
                    let url = `/course-program-lesson/${groupCourse.id}`;

                    // Add enrollmentId to query params if available
                    if (enrollmentId) {
                      url += `?enrollmentId=${enrollmentId}`;
                    }

                    router.push(url);
                  }}
                >
                  <p style={{ marginBottom: 0, color: '#000', fontWeight: 500 }}>
                    {t('goToCourse')}
                  </p>
                  <span className="box-icon">
                    <i className="fa-regular fa-arrow-right-long first-icon"></i>
                    <i className="fa-regular fa-arrow-right-long second-icon"></i>
                  </span>
                </Link>
              </div>
            )}

            {/* Instructor view - Update & Delete buttons */}
            {viewMode === COURSE_VIEW_MODE.INSTRUCTOR && (
              <div
                className="bd-course-btn d-flex gap-5 align-items-center justify-content-between"
                style={{ width: '100%' }}
              >
                <button
                  className="bd-text-btn custom-btn-course"
                  onClick={() => onUpdate && onUpdate(groupCourse.id)}
                  type="button"
                  style={{ width: '100%' }}
                >
                  {t('update')}
                  <span className="box-icon">
                    <i className="fa-regular fa-pen-to-square first-icon"></i>
                    <i className="fa-regular fa-pen-to-square second-icon"></i>
                  </span>
                </button>
                <button
                  className="bd-text-btn text-danger custom-btn-course"
                  onClick={() => onDelete && onDelete(groupCourse.id)}
                  type="button"
                >
                  {t('delete')}
                  <span className="box-icon">
                    <i className="fa-regular fa-trash first-icon"></i>
                    <i className="fa-regular fa-trash second-icon"></i>
                  </span>
                </button>
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

export default GroupCourseCard;
