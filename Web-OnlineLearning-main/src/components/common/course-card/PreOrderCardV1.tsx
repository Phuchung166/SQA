'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PreOrderCourse, createPreOrderEnrollment } from '@/services/courseService';
import { useTranslations } from 'next-intl';
import { calculateDiscountPercent, formatCurrency } from '@/utils/HelperUtils';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { selectIsLoggedIn } from '@/redux/slices/authSlice';
import { useNotification } from '@/hooks/useMessage';
import { getCourseShareUrl, handleShare } from '@/utils/shareUtils';
import { useCountdown } from '@/hooks/useCountdown';
import { Dropdown, MenuProps } from 'antd';
import { SiStreamrunners } from 'react-icons/si';
import './styles.scss';

interface PreOrderCardV1Props {
  course: PreOrderCourse;
  isHostAllowed?: (url?: string) => boolean;
  onAddToWishlist?: (course: PreOrderCourse) => void;
  noColWrapper?: boolean;
}

const PreOrderCardV1: React.FC<PreOrderCardV1Props> = ({ course, noColWrapper = false }) => {
  const t = useTranslations('OnlineCourse');
  const router = useRouter();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const notification = useNotification();
  const [loading, setLoading] = React.useState(false);
  const countdown = useCountdown(course.pre_order_end_date);

  const shareUrl = getCourseShareUrl(course.id, 'COURSE');
  const shareTitle = course.title || t('preOrderCourse');

  const onHandleShare = async (
    platform: 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy',
  ) => {
    await handleShare(platform, { url: shareUrl, title: shareTitle }, (type, message) => {
      if (type === 'success') {
        notification.success({ message: t('copied'), description: message, duration: 2 });
      } else {
        notification.error({ message: t('error'), description: message, duration: 2 });
      }
    });
  };

  const shareMenuItems: MenuProps['items'] = [
    {
      key: 'facebook',
      label: (
        <span>
          <i className="fab fa-facebook mr-2 text-blue-600"></i> Facebook
        </span>
      ),
      onClick: () => onHandleShare('facebook'),
    },
    {
      key: 'twitter',
      label: (
        <span>
          <i className="fab fa-twitter mr-2 text-sky-400"></i> Twitter
        </span>
      ),
      onClick: () => onHandleShare('twitter'),
    },
    {
      key: 'copy',
      label: (
        <span>
          <i className="fa-light fa-copy mr-2"></i> Copy Link
        </span>
      ),
      onClick: () => onHandleShare('copy'),
    },
  ];

  const navigateToCourse = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/course-details/${course.id}`);
  };

  const cardContent = (
    <div className="preorder-card-container">
      {/* Top Badges */}
      <div className="card-header-actions">
        <div className="badge-hot">
          <i className="fas fa-fire-alt animate-bounce" />
          <span>{t('hotDeal')}</span>
        </div>
        <div className="action-buttons">
          <Dropdown menu={{ items: shareMenuItems }} trigger={['click']}>
            <button className="icon-btn-glass">
              <i className="fa-light fa-share" />
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Thumbnail Area */}
      <div className="thumbnail-wrapper" onClick={navigateToCourse}>
        {course.thumbnail && (
          <Image src={course.thumbnail} alt={course.title} fill className="course-img" />
        )}
        <div className="thumbnail-overlay" />
      </div>

      {/* Sleek Countdown */}
      {!countdown.isExpired && (
        <div className="countdown-glass-mini">
          <span className="text-[10px] uppercase tracking-wider opacity-80">{t('endsIn')}</span>
          <div className="timer-values">
            {countdown.days > 0 && <span>{countdown.days}d : </span>}
            <span>{String(countdown.hours).padStart(2, '0')}h : </span>
            <span>{String(countdown.minutes).padStart(2, '0')}m : </span>
            <span className="text-rose-400">{String(countdown.seconds).padStart(2, '0')}s</span>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className="card-body-content">
        <Link href={`/courses?category=${course?.category?.id}`} className="category-tag">
          {course?.category?.name || 'Course'}
        </Link>

        <h3 className="course-title" onClick={navigateToCourse}>
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="instructor-row">
          <div className="avatar-ring">
            <Image
              src={course.instructor?.avatar || '/assets/images/instructor/avatar_default.jfif'}
              alt="instructor"
              width={32}
              height={32}
            />
          </div>
          <div className="info">
            <span className="name">
              {course.instructor?.first_name} {course.instructor?.last_name}
            </span>
            <span className="lessons">
              <i className="icon-books-pile" /> {course?.total_lessons} {t('lessons')}
            </span>
          </div>
        </div>

        {/* Slots & Progress */}
        <div className="slots-section">
          <div className="slots-header">
            <span className="label text-slate-600 font-medium">
              {t('totalSlots') || 'Total Slots'}
            </span>
            <span className="count">{course.pre_order_total_slots}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${((course.pre_order_total_slots - course.pre_order_remaining_slots) / course.pre_order_total_slots) * 100}%`,
              }}
            >
              <div className="shine-effect" />
            </div>
          </div>
          <p className="hurry-text">
            {course.pre_order_remaining_slots === 0 ? (
              t('soldOut')
            ) : (
              <>
                <SiStreamrunners color="#341f97" className="inline-block mr-1" />{' '}
                {course.pre_order_remaining_slots} {t('slotsLeft')}
              </>
            )}
          </p>
        </div>

        {/* Pricing Box */}
        <div className="pricing-card-inner">
          <div className="price-main">
            <span className="current">
              {formatCurrency(course.pre_order_price)} {course.currency}
            </span>
            <span className="original">{formatCurrency(course.price)}</span>
          </div>
          <div className="save-badge">
            -{calculateDiscountPercent(course.price, course.pre_order_price)}% OFF
          </div>
        </div>

        {/* Main Action Button */}
        <button
          onClick={navigateToCourse}
          disabled={loading || course.pre_order_remaining_slots === 0}
          className={`main-enroll-btn ${course.pre_order_remaining_slots === 0 ? 'sold-out' : ''}`}
        >
          {loading ? (
            <i className="fa fa-spinner fa-spin mr-2" />
          ) : (
            <i className="fas fa-bolt mr-2" />
          )}
          {course.pre_order_remaining_slots === 0 ? t('soldOut') : t('enrollNow')}
        </button>
      </div>
    </div>
  );

  return noColWrapper ? (
    cardContent
  ) : (
    <div className="col-xl-4 col-lg-6 col-md-6 mb-4" key={course.id}>
      {cardContent}
    </div>
  );
};

export default PreOrderCardV1;
