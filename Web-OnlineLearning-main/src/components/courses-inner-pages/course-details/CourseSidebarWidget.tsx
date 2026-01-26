'use client';
import React, { useState } from 'react';
import {
  Course,
  createPreOrderEnrollment,
  PreOrderEnrollmentRequest,
} from '@/services/courseService';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addCartItem } from '@/redux/slices/cartSlice';
import { selectIsLoggedIn } from '@/redux/slices/authSlice';
import { useVideoModal } from '@/contextApi/VideoProvider';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/utils/HelperUtils';
import Image from 'next/image';
import { createEnrollment } from '@/services/enrollService';
import { createOrder } from '@/services/orderService';
import { getErrorMessage } from '@/services/apiError';
import { useNotification } from '@/hooks/useMessage';
import { useRouter } from 'next/navigation';
import { formatMsDuration } from '@/utils/time';
import { memo } from 'react';

interface CourseSidebarWidgetProps {
  course?: Course;
  loading?: boolean;
  courseId: number;
  isEnrolled?: boolean;
  checkingEnrollment?: boolean;
  enrollmentId?: number | null;
}

const CourseSidebarWidget = ({
  courseId,
  course,
  loading,
  isEnrolled = false,
  checkingEnrollment = false,
  enrollmentId = 0,
}: CourseSidebarWidgetProps) => {
  const t = useTranslations('CourseDetails');
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const { playVideo } = useVideoModal();
  const notification = useNotification();
  const router = useRouter();

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Handle pre-order enrollment
  const handlePreOrderEnrollment = async (courseId: number) => {
    if (!courseId) return;

    // Check authentication
    if (!isLoggedIn) {
      notification.error({
        message: t('pleaseLogin') || 'Please log in',
        description: t('loginToEnroll') || 'You need to log in to enroll in this course.',
      });
      router.push('/sign-in');
      return;
    }

    if (isEnrolling) return;
    setIsEnrolling(true);
    try {
      const response = await createPreOrderEnrollment({
        course_id: courseId,
      });

      notification.success({
        message: t('preOrderSuccess') || 'Pre-order successful',
        description:
          t('preOrderSlotReserved', { slot: response.slot_number }) ||
          `Slot ${response.slot_number} reserved. Redirecting to payment...`,
        duration: 2,
      });

      // Redirect to payment
      if (response.payment_response?.payment_url) {
        window.location.href = response.payment_response.payment_url;
      } else {
        notification.error({
          message: t('paymentFailed') || 'Payment failed',
          description: t('paymentUrlNotAvailable') || 'Payment URL not available',
        });
      }
    } catch (err: any) {
      console.log('Pre-order error: ', err);
      notification.error({
        message: t('preOrderEnrollmentFailed') || 'Pre-order enrollment failed',
        description: getErrorMessage(err) || t('tryAgain') || 'Please try again',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleEnrollFreeCourse = async (courseId: number) => {
    if (!courseId) return;

    // Check authentication
    if (!isLoggedIn) {
      notification.error({
        message: t('pleaseLogin') || 'Please log in',
        description: t('loginToEnroll') || 'You need to log in to enroll in this course.',
      });
      router.push('/sign-in');
      return;
    }

    if (isEnrolling) return;
    setIsEnrolling(true);
    try {
      // Check if course is free
      if (course?.is_free || (course?.price || 0) === 0) {
        // Free course - use enrollment API
        await createEnrollment(courseId);
        notification.success({
          message: t('enrollSuccess') || 'Enrolled',
          description: t('youAreEnrolled') || 'You have been enrolled in this course.',
        });
        router.push(`/student-enrolled-courses`);
      } else {
        // Paid course - create order and redirect to payment
        const orderResponse = await createOrder({
          total_money: course?.price || 0,
          cart_item_list: [{ course_id: courseId }],
        });

        // Redirect to payment URL
        if (orderResponse.payment_response?.payment_url) {
          window.location.href = orderResponse.payment_response.payment_url;
        } else {
          notification.error({
            message: t('paymentFailed') || 'Payment failed',
            description: t('paymentUrlNotAvailable') || 'Payment URL not available',
          });
        }
      }
    } catch (err: any) {
      console.log('Enrollment/Order error: ', err);
      notification.error({
        message: course?.is_free
          ? t('enrollFailed') || 'Enrollment failed'
          : t('orderFailed') || 'Order failed',
        description: getErrorMessage(err) || t('tryAgain') || 'Please try again',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleAddToCart = async (courseId: number) => {
    if (!courseId) return;
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      // Dispatch Redux thunk which will handle the API call and show toast notifications
      const result = await dispatch(addCartItem(courseId)).unwrap();
      // Redux thunk already shows success toast, so we just log it
      console.log('Added to cart:', result);
    } catch (err: any) {
      // Redux thunk already shows error toast, but we can optionally add additional notification
      const errorMsg = err?.message || 'Failed to add course to cart';
      console.error('Error adding to cart:', errorMsg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="bd-course-sidebar-widget sidebar-right sidebar-sticky">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t('loading') || 'Loading...'}</span>
          </div>
          <p className="mt-2">{t('loadingMessage')}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bd-course-sidebar-widget sidebar-right sidebar-sticky">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <p className="mb-0">{t('courseInfoNotAvailable')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bd-course-sidebar-widget sidebar-right sidebar-sticky">
        <div className="bd-course-sidebar-widget-thumb mb-20 p-relative">
          <Image
            style={{ width: '100%', height: 'auto' }}
            src={course.thumbnail || '/assets/images/course/course-video.webp'}
            alt={course.title || 'Course preview'}
            width={40}
            height={40}
          />
          <div className="thumb-btn">
            <button
              type="button"
              onClick={() => {
                if (course.preview_video) {
                  // Use the preview video URL directly (supports MP4, YouTube, etc.)
                  playVideo(course.preview_video);
                } else {
                  // Fallback to default YouTube video
                  playVideo('HKk4oLIzhhM', 'youtube');
                }
              }}
              className="bd-video-btn popup-video has-bg"
            >
              <span className="icon">
                <i className="fa-solid fa-play"></i>
              </span>
            </button>
          </div>
        </div>
        <div className="bd-course-sidebar-widget-price mb-20">
          <div className="bd-course-price">
            {course.is_pre_order ? (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#ff6b6b',
                      fontWeight: 600,
                      marginBottom: '5px',
                    }}
                  >
                    <i className="fas fa-fire"></i> {t('hotDeal')}
                  </div>
                  <span className="current-price" style={{ fontSize: '24px', color: '#ff6b6b' }}>
                    {formatCurrency(course?.pre_order_price || 0)} {course.currency}
                  </span>
                </div>
                <span className="old-price">
                  {formatCurrency(course?.price)} {course.currency}
                </span>
              </>
            ) : (
              <>
                <span className="current-price">
                  {formatCurrency(course?.price)} {course.currency}
                </span>
              </>
            )}
            {course.is_free && <span className="free-badge text-success">{t('free')}</span>}
          </div>
        </div>
        {course.is_pre_order && (
          <div className="bd-course-sidebar-widget-slots mb-20">
            <div className="bd-course-slots-card">
              <div className="bd-course-slots-header">
                <span className="bd-course-slots-title">{t('slots') || 'Slots Available'}</span>
              </div>
              <div className="bd-course-slots-count">
                {course?.pre_order_remaining_slots || 0}/{course?.pre_order_total_slots || 0}{' '}
                {t('available') || 'available'}
              </div>
              <div className="bd-course-slots-progress">
                <div
                  className="bd-course-slots-progress-bar"
                  style={{
                    width: `${(((course?.pre_order_total_slots || 0) - (course?.pre_order_remaining_slots || 0)) / (course?.pre_order_total_slots || 1)) * 100}%`,
                  }}
                ></div>
              </div>
              {course?.pre_order_remaining_slots === 0 && (
                <div className="bd-course-slots-soldout">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {t('soldOut') || 'Sold Out'}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="bd-course-sidebar-widget-list mb-20">
          <ul>
            <li>
              <div className="icon">
                <i className="fas fa-filter"></i>
                <span>{t('level')}</span>
              </div>
              <div className="video-corse-info">
                <span>
                  {course.level?.charAt(0).toUpperCase() + course.level?.slice(1) ||
                    t('notSpecified') ||
                    'Not specified'}
                </span>
              </div>
            </li>
            <li>
              <div className="icon">
                <i className="fas fa-desktop"></i>
                <span>{t('lectures')}</span>
              </div>
              <div className="video-corse-info">
                <span>
                  {course?.total_lessons} {t('lectures')}
                </span>
              </div>
            </li>
            <li>
              <div className="icon">
                <i className="far fa-clock"></i>
                <span>{t('duration')}</span>
              </div>
              <div className="video-corse-info">
                <span>{formatMsDuration(course?.duration)}</span>
              </div>
            </li>
            <li>
              <div className="icon">
                <i className="fas fa-th-list"></i>
                <span>{t('category')}</span>
              </div>
              <div className="video-corse-info">
                <span>{course.category?.name || t('generalCategory') || 'General'}</span>
              </div>
            </li>
            {/* <li>
              <div className="icon">
                <i className="fas fa-globe"></i>
                <span>{t('language')}</span>
              </div>
              <div className="video-corse-info">
                <span>{course.language || 'English'}</span>
              </div>
            </li> */}
            <li>
              <div className="icon">
                <i className="fas fa-bookmark"></i>
                <span>{t('access')}</span>
              </div>
              <div className="video-corse-info">
                <span>{t('fullLifetime')}</span>
              </div>
            </li>
            {/* <li>
              <div className="icon">
                <i className="fas fa-file-alt"></i>
                <span>{t('resources')}</span>
              </div>
              <div className="video-corse-info">
                <span>5 {t('downloadableFiles')}</span>
              </div>
            </li> */}
          </ul>
        </div>
        <div className="bd-course-sidebar-widget-btn d-flex-between flex-wrap gap-15">
          {checkingEnrollment ? (
            <div className="w-100 text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">{t('checkingEnrollment')}</span>
              </div>
              <p className="mt-2 mb-0 text-muted small">{t('checkingEnrollmentStatus')}</p>
            </div>
          ) : isEnrolled ? (
            <div className="w-100">
              {course.is_pre_order ? (
                <>
                  <div className="alert alert-info mb-3" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {t('alreadyPreOrdered') || 'You have already pre-ordered this course'}
                  </div>
                  <button
                    onClick={() => router.push('/student-enrolled-courses')}
                    className="bd-btn btn-info w-100"
                  >
                    <span className="left-icon">
                      <i className="fal fa-list"></i>
                    </span>
                    <span>{t('viewMyPreOrders') || 'View My Pre-Orders'}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="alert alert-success mb-3" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {t('alreadyEnrolled')}
                  </div>
                  <button
                    onClick={() =>
                      (window.location.href = `/course-lesson/${courseId}?enrollmentId=${enrollmentId}`)
                    }
                    className="bd-btn btn-success w-100"
                  >
                    <span className="left-icon">
                      <i className="fal fa-play-circle"></i>
                    </span>
                    <span>{t('goToMyCourses')}</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() =>
                  course.is_pre_order
                    ? handlePreOrderEnrollment(courseId)
                    : handleEnrollFreeCourse(courseId)
                }
                className={`bd-btn ${course.is_pre_order ? 'btn-warning' : 'btn-primary'} w-100`}
                disabled={
                  isEnrolling ||
                  !isLoggedIn ||
                  (course.is_pre_order && course.pre_order_remaining_slots === 0)
                }
                title={!isLoggedIn ? t('pleaseLoginToEnroll') || '' : ''}
                style={{
                  opacity:
                    !isLoggedIn || (course.is_pre_order && course.pre_order_remaining_slots === 0)
                      ? 0.5
                      : 1,
                  cursor:
                    !isLoggedIn || (course.is_pre_order && course.pre_order_remaining_slots === 0)
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                <span className="left-icon">
                  <i
                    className={
                      course.is_pre_order
                        ? 'fas fa-fire'
                        : course.is_free
                          ? 'fal fa-user-check'
                          : 'fal fa-credit-card'
                    }
                  ></i>
                </span>
                <span>
                  {isEnrolling
                    ? course.is_pre_order
                      ? t('processingPreOrder') || 'Processing...'
                      : course.is_free
                        ? t('enrolling')
                        : t('processing')
                    : course.is_pre_order
                      ? t('preOrderNow') || 'Pre-order Now'
                      : course.is_free
                        ? t('enrollFree')
                        : t('buyNow')}
                </span>
              </button>
              {!course.is_free && !course.is_pre_order && (
                <button
                  onClick={() => handleAddToCart(courseId)}
                  className="bd-btn btn-outline-primary w-100"
                  disabled={isAddingToCart || !isLoggedIn}
                  title={!isLoggedIn ? t('pleaseLoginToAddCart') || '' : ''}
                  style={{
                    opacity: !isLoggedIn ? 0.5 : 1,
                    cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span className="left-icon">
                    <i className="fal fa-shopping-cart"></i>
                  </span>
                  <span>{isAddingToCart ? t('loading') : t('addToCart')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(CourseSidebarWidget);
