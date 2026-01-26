'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { calculateDiscountPercent, encodeUrl, formatCurrency } from '@/utils/HelperUtils';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addCartItem } from '@/redux/slices/cartSlice';
import { selectIsLoggedIn } from '@/redux/slices/authSlice';
import { useNotification } from '@/hooks/useMessage';
import { getCourseShareUrl, handleShare } from '@/utils/shareUtils';
import { useCountdown } from '@/hooks/useCountdown';
import { Dropdown, MenuProps } from 'antd';

interface CourseCardProps {
  course: Course;
  isHostAllowed?: (url?: string) => boolean;
  onAddToWishlist?: (course: Course) => void;
  noColWrapper?: boolean; // Add prop to control col wrapper
}

const CourseCardV1: React.FC<CourseCardProps> = ({ course, noColWrapper = false }) => {
  const t = useTranslations('OnlineCourse');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const notification = useNotification();
  const countdown = useCountdown(course.pre_order_end_date);

  // Get course detail URL
  const shareUrl = getCourseShareUrl(
    course.id,
    (course as any)?.course_type || (course as any)?.type,
  );
  const shareTitle = course.title || 'Check out this course';

  const onHandleShare = async (
    platform: 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy',
  ) => {
    await handleShare(platform, { url: shareUrl, title: shareTitle }, (type, message) => {
      if (type === 'success') {
        notification.success({
          message: 'Copied!',
          description: message,
          duration: 2,
        });
      } else {
        notification.error({
          message: 'Error',
          description: message,
          duration: 2,
        });
      }
    });
  };

  const shareMenuItems: MenuProps['items'] = [
    {
      key: 'facebook',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fab fa-facebook"></i>
          Facebook
        </div>
      ),
      onClick: () => onHandleShare('facebook'),
    },
    {
      key: 'twitter',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fab fa-twitter"></i>
          Twitter
        </div>
      ),
      onClick: () => onHandleShare('twitter'),
    },
    {
      key: 'linkedin',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fab fa-linkedin"></i>
          LinkedIn
        </div>
      ),
      onClick: () => onHandleShare('linkedin'),
    },
    {
      key: 'telegram',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fab fa-telegram"></i>
          Telegram
        </div>
      ),
      onClick: () => onHandleShare('telegram'),
    },
    {
      type: 'divider',
    },
    {
      key: 'copy',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-light fa-copy"></i>
          Copy Link
        </div>
      ),
      onClick: () => onHandleShare('copy'),
    },
  ];

  // Navigate to the correct page. For STANDALONE courses we try to fetch the sub-course id
  // and include it as a query param so the course-detail page can load the subcourse modules.
  const navigateToCourse = async (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    try {
      const rawType = (course as any)?.course_type || (course as any)?.type || null;
      const type = typeof rawType === 'string' ? rawType.toLowerCase() : null;

      if (type === 'program' || type === 'specialization') {
        router.push(`/course-program/${course.id}`);
        return;
      }

      router.push(`/course-details/${course.id}`);
    } catch {
      // ensure we still navigate on unexpected errors
      router.push(`/course-details/${course.id}`);
    }
  };

  const cardContent = (
    <div className="bd-course-wrapper style-five">
      <div className="bd-course-info">
        <div className="bd-course-info-wrapper">
          <div className="bd-course-info-label mb-15">
            {t('level')} : <span>{course.level}</span>
          </div>
          <div
            className="course-short-description"
            dangerouslySetInnerHTML={{ __html: course.description }}
          ></div>
          <div className="bd-course-info-list">
            {/* <ul>
                  {course.courseList?.map((topic, index) => (
                  <li key={index}>
                      <i className="far fa-check"></i> {topic}
                  </li>
                  ))}
              </ul> */}
          </div>
          {course.is_pre_order ? (
            <div className="bd-course-price mb-20">
              <div className="bd-preorder-badge">
                <i className="fas fa-fire"></i>
                <span>{t('hotDeal')}</span>
              </div>
              <span
                className="current-price has-big"
                style={{ fontSize: '18px', fontWeight: 700, color: '#ff6b6b' }}
              >
                {`${formatCurrency(course.pre_order_price || 0)} ${course.currency}`}
              </span>
              <span className="old-price has-big">
                {`${formatCurrency(course.price)} ${course.currency}`}
              </span>
            </div>
          ) : (
            <div className="bd-course-price mb-20">
              <span className="current-price has-big">{`${formatCurrency(course.price)} ${course.currency}`}</span>
            </div>
          )}
          <div className="bd-course-action-btn d-flex align-items-center gap-15 flex-wrap">
            <Link
              href={`#`}
              onClick={e => navigateToCourse(e, course)}
              className="bd-btn btn-outline-border-primary"
            >
              {t('viewDetails') || 'View Details'}
            </Link>
            {!course.is_pre_order && (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    notification.error({
                      message: 'Please log in',
                      description: 'You need to log in to add courses to cart.',
                    });
                    router.push('/auth/login');
                    return;
                  }
                  dispatch(addCartItem(course.id));
                }}
                disabled={!isLoggedIn}
                className="bd-btn btn-primary"
                type="button"
                style={{
                  opacity: !isLoggedIn ? 0.5 : 1,
                  cursor: !isLoggedIn ? 'not-allowed' : 'pointer',
                }}
              >
                {t('addToCart') || 'Add to Cart'}
              </button>
            )}

            <Dropdown menu={{ items: shareMenuItems }} placement="bottomRight" trigger={['click']}>
              <button className="bd-btn-icon btn-info outline-info" title="Share course">
                <i className="fa-light fa-share"></i>
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
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
          {course.thumbnail && (
            <Image
              src={course.thumbnail}
              // style={{ width: '100%', height: 'auto' }}
              alt="images"
              width={100}
              height={100}
            />
          )}
        </div>
      </Link>
      <div className="bd-course-content ">
        <div className="bd-course-heading d-flex-between mb-15">
          <Link
            className="bd-badge badge-primary"
            href={`courses-filter-category/${encodeUrl(course?.category?.name || '')}?category=${course?.category?.id}`}
          >
            {course?.category?.name || 'Online Learning Badge'}
          </Link>
          <div className="bd-course-rating-wrap d-flex align-items-center gap-10">
            <div className="bd-course-rating-icon fs-14 d-flex rating-color">
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="bd-course-rating-text">
              <span>
                {(course?.review?.avg_rating || 0).toFixed(1) +
                  ' (' +
                  (course?.review?.total_reviews || 0) +
                  ')'}
              </span>
            </div>
          </div>
        </div>
        <div className="bd-course-text mb-10">
          <h5 className="bd-course-title underline">
            <Link href="#" onClick={e => navigateToCourse(e, course)}>
              {course.title}
            </Link>
          </h5>
        </div>
        <div className="bd-course-meta">
          <div className="bd-course-price mb-15">
            <span className="current-price has-big text-primary">{`${formatCurrency(course.price)} ${course.currency}`}</span>
            {/* <span className="old-price has-big">{`${formatCurrency(course.original_price)} ${course.currency}`}</span> */}
          </div>
          <div className="d-flex-between">
            <div className="bd-course-author">
              <div className="thumb">
                {course.instructor?.avatar && (
                  <Image
                    src={
                      course.instructor.avatar || '/assets/images/instructor/avatar_default.jfif'
                    }
                    alt="author"
                    width={40}
                    height={40}
                  />
                )}
              </div>
              <div className="name">
                <Link href="#">
                  {course.instructor?.first_name} {course.instructor?.last_name}
                </Link>
              </div>
            </div>
            <div className="bd-course-student">
              <span>
                <i className="fa-light fa-users"></i>{' '}
                {(course.total_students || 0) + ' ' + t('students')}
              </span>
            </div>
          </div>
        </div>
        <div className="bd-course-full-border"></div>
        <div className="bd-course-footer d-flex-between border-pile">
          <div className="bd-course-lesson">
            <span>
              <i className="icon-books-pile"></i> {(course.total_lessons || 0) + ' ' + t('lessons')}
            </span>
          </div>
          <div className="bd-course-btn">
            <Link className="bd-text-btn" onClick={e => navigateToCourse(e, course)} href="#">
              <p style={{ marginBottom: 0, color: '#000', fontWeight: 500 }}>
                {t('enrollNow') || 'Enroll Now'}
              </p>
              <span className="box-icon">
                <i className="fa-regular fa-arrow-right-long first-icon"></i>
                <i className="fa-regular fa-arrow-right-long second-icon"></i>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return noColWrapper ? (
    cardContent
  ) : (
    <div className="col-xl-4 col-lg-6 col-md-6" key={course.id}>
      {cardContent}
    </div>
  );
};
export default CourseCardV1;
