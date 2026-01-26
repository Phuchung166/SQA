'use client';

import CourseReviewForm from '@/form/CourseReviewForm';
import useGlobalContext from '@/hooks/useContexts';
import SlideToggle from '@/utils/SlideToggle';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface CommonReviewFormProps {
  courseId?: number;
  onReviewSubmitted?: () => void;
}

const CommonReviewForm: React.FC<CommonReviewFormProps> = ({ courseId, onReviewSubmitted }) => {
  const t = useTranslations('courses');
  const { toggleOpen } = useGlobalContext();
  const searchParams = useSearchParams();
  const urlCourseId = searchParams.get('id');
  const actualCourseId = courseId || (urlCourseId ? parseInt(urlCourseId) : undefined);
  const [rating, setRating] = useState(5);

  const handleStarClick = (index: number) => {
    const newRating = index + 1;
    setRating(newRating);
  };

  const handleReviewSubmitted = () => {
    setRating(5);
    if (onReviewSubmitted) {
      onReviewSubmitted();
    }
  };

  return (
    <>
      {/* course review form */}
      <div className="review-form">
        <button onClick={toggleOpen} id="show-review-box" className="bd-btn btn-primary">
          {t('writeReview') || 'Write a Review'}
        </button>
        <SlideToggle className="bd-review-form mt-15">
          <div className="bd-review-form-rating mb-15">
            <p>
              {t('reviewDisclaimer') ||
                'Your email address will not be published. Required fields are marked *'}
            </p>
            <div
              className="bd-ratings-wrapper bd-ratings-wrapper-two rating-spacing-2"
              style={{
                cursor: 'pointer',
                display: 'flex',
                gap: '8px',
              }}
            >
              {[0, 1, 2, 3, 4].map(index => (
                <i
                  key={index}
                  className={`fa ${index < rating ? 'fas fa-star' : 'far fa-star'}`}
                  onClick={() => handleStarClick(index)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStarClick(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={t('rateStars', { count: index + 1 }) || `Rate ${index + 1} stars`}
                  style={{
                    cursor: 'pointer',
                    color: index < rating ? '#ffc107' : '#ccc',
                    fontSize: '24px',
                    transition: 'color 0.2s ease, transform 0.2s ease',
                    transform: index < rating ? 'scale(1.1)' : 'scale(1)',
                    userSelect: 'none',
                    marginRight: '4px',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = '#ffc107';
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color =
                      index < rating ? '#ffc107' : '#ccc';
                    (e.currentTarget as HTMLElement).style.transform =
                      index < rating ? 'scale(1.1)' : 'scale(1)';
                  }}
                ></i>
              ))}
            </div>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              {t('currentRating', { rating, max: 5 }) || `Current rating: ${rating} / 5 stars`}
            </p>
          </div>
          <CourseReviewForm
            courseId={actualCourseId}
            rating={rating}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </SlideToggle>
      </div>
    </>
  );
};

export default CommonReviewForm;
