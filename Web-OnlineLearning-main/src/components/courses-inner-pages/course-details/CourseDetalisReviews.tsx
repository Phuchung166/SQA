import { Review, getReviews } from '@/services/reviewService';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, memo } from 'react';
import { useTranslations } from 'next-intl';
import { Pagination } from 'antd';

const StarRating: React.FC<{ rating: number }> = memo(({ rating }) => (
  <div className="post-rating rating-spacing-2">
    {[...Array(5)].map((_, index) => (
      <Link href="#" key={index}>
        <i className={`fa ${index < rating ? 'fa-star' : 'fa-star-o'}`}></i>
      </Link>
    ))}
  </div>
));

StarRating.displayName = 'StarRating';

const ReviewItem: React.FC<{ review: Review; translate: (key: string) => string }> = memo(
  ({ review, translate }) => {
    return (
      <li>
        <div className="bd-postbox-comment-box d-sm-flex align-items-start">
          <div className="bd-postbox-comment-info">
            <div className="bd-postbox-comment-avatar">
              <Image
                src={review.user.avatar || '/placeholder.png'}
                alt={review.user.account_name}
                width={40}
                height={40}
              />
            </div>
          </div>
          <div className="bd-postbox-comment-text">
            {review.rating !== 0 && (
              <div className="d-flex flex-wrap gap-15 align-items-center mb-10">
                <StarRating rating={review.rating} />
              </div>
            )}
            <div className="bd-postbox-comment-name">
              <h5 className="title mb--5">
                <a href="#">{review.user.account_name}</a>
              </h5>
              <span className="post-meta">
                {review.created_at
                  ? new Date(review.created_at).toLocaleDateString('vi-VN')
                  : translate('unknownDate')}
              </span>
            </div>
            <p>{review.comment}</p>
          </div>
        </div>
      </li>
    );
  },
);

ReviewItem.displayName = 'ReviewItem';

interface CourseDetailsReviewsProps {
  courseId?: number;
}

const CourseDetailsReviewsInner: React.FC<CourseDetailsReviewsProps> = ({ courseId }) => {
  const _t = useTranslations('CourseDetails');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [_totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!courseId) return;

    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getReviews({
          page: currentPage,
          pageSize: pageSize,
          courseId,
          rating: selectedRating || undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        setReviews(response.data || []);
        setTotalElements(response.total_elements || 0);
        console.log('Fetched Reviews:', response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [courseId, selectedRating, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="bd-course-detalis-reviews mb-30">
        <h3 className="bd-course-details-content-title">{_t('reviews')}</h3>
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // No need to filter locally - API handles it
  // totalElements comes from API response
  const totalReviews = _totalElements;

  if (reviews.length === 0) {
    return (
      <div className="bd-course-detalis-reviews mb-30">
        <h3 className="bd-course-details-content-title">{_t('reviews')}</h3>

        {/* Rating filter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '14px', color: '#666' }}>{_t('filterByStar')}</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => {
                setSelectedRating(null);
                setCurrentPage(1);
              }}
              style={{
                background: selectedRating === null ? '#07a169' : '#e9ecef',
                color: selectedRating === null ? '#fff' : '#333',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {_t('allReviews')}
            </button>
            {[5, 4, 3, 2, 1].map(star => (
              <button
                key={star}
                onClick={() => {
                  setSelectedRating(star);
                  setCurrentPage(1);
                }}
                style={{
                  background: selectedRating === star ? '#ffc107' : '#f5f5f5',
                  color: selectedRating === star ? '#fff' : '#333',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                {star} <i className="fas fa-star" style={{ marginLeft: '3px' }}></i>
              </button>
            ))}
          </div>
        </div>

        <div className="alert alert-info d-flex align-items-center" role="alert">
          <i className="fas fa-info-circle"></i>
          <p className="mb-0" style={{ marginLeft: '10px' }}>
            {selectedRating
              ? _t('noReviewsForRating', { rating: selectedRating })
              : _t('noReviewsYet')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bd-course-detalis-reviews mb-30">
      <h3 className="bd-course-details-content-title">{_t('reviews')}</h3>

      {/* Rating filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '14px', color: '#666' }}>{_t('filterByStar')}</span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => {
              setSelectedRating(null);
              setCurrentPage(1);
            }}
            style={{
              background: selectedRating === null ? '#07a169' : '#e9ecef',
              color: selectedRating === null ? '#fff' : '#333',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map(star => (
            <button
              key={star}
              onClick={() => {
                setSelectedRating(star);
                setCurrentPage(1);
              }}
              style={{
                background: selectedRating === star ? '#ffc107' : '#f5f5f5',
                color: selectedRating === star ? '#fff' : '#333',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {star} <i className="fas fa-star" style={{ marginLeft: '3px' }}></i>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        {_t('totalReviews')}: <strong>{totalReviews}</strong>
      </div>
      <div className="bd-postbox-comment">
        <ul>
          {reviews.map(review => (
            <ReviewItem key={review.id} review={review} translate={_t} />
          ))}
        </ul>
      </div>

      {/* Pagination */}
      {totalReviews > pageSize && (
        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalReviews}
            onChange={page => {
              setCurrentPage(page);
              // Scroll to reviews section
              const reviewsSection = document.querySelector('.bd-course-detalis-reviews');
              if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            onShowSizeChange={(_, size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            showSizeChanger={true}
            pageSizeOptions={['5', '10', '20']}
            showTotal={total =>
              _t('paginationShowing', {
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, total),
                total: total,
              })
            }
            locale={{
              items_per_page: _t('itemsPerPage'),
              jump_to: _t('jumpToPage'),
              jump_to_confirm: _t('jumpToConfirm'),
              page: _t('page'),
              prev_page: _t('prevPage'),
              next_page: _t('nextPage'),
              prev_5: _t('prev5'),
              next_5: _t('next5'),
              prev_3: _t('prev3'),
              next_3: _t('next3'),
            }}
          />
        </div>
      )}
    </div>
  );
};

const CourseDetailsReviews = memo(CourseDetailsReviewsInner);
CourseDetailsReviews.displayName = 'CourseDetailsReviews';

export default CourseDetailsReviews;
