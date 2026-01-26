import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { createReview } from '@/services/reviewService';
import { message } from 'antd';
import { useTranslations } from 'next-intl';

interface CourseReviewFormProps {
  courseId?: number;
  rating?: number;
  onReviewSubmitted?: () => void;
}

const CourseReviewForm: React.FC<CourseReviewFormProps> = ({
  courseId,
  rating = 5,
  onReviewSubmitted,
}) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppSelector(state => state.auth.user);

  const [comment, setComment] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  // Get course ID from URL if not provided as prop
  const urlCourseId = searchParams.get('id');
  const actualCourseId = courseId || (urlCourseId ? parseInt(urlCourseId) : undefined);

  // Update form rating when prop changes
  useEffect(() => {
    setFormRating(rating);
  }, [rating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      message.error(t('review.loginRequired') || 'Please login to submit a review');
      router.push('/sign-in');
      return;
    }

    if (!actualCourseId) {
      message.error(t('review.courseIdNotFound') || 'Course ID not found');
      return;
    }

    if (!comment || comment.trim().length === 0) {
      message.error(t('review.commentRequired') || 'Please enter a comment');
      return;
    }

    if (formRating < 1 || formRating > 5) {
      message.error(t('review.invalidRating') || 'Please select a valid rating');
      return;
    }

    try {
      setIsLoading(true);
      const reviewData = {
        comment: comment.trim(),
        course_id: actualCourseId,
        rating: formRating,
      };

      await createReview(reviewData);

      message.success(t('review.submitSuccess') || 'Review submitted successfully!');
      setComment('');
      setFormRating(5);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch {
      message.error(t('review.submitFailed') || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="row gy-30">
          <div className="col-xxl-12">
            <div className="bd-postbox-comment-input mb-15">
              <textarea
                placeholder={t('review.commentPlaceholder') || 'Your Comment Here...'}
                value={comment}
                onChange={e => {
                  setComment(e.target.value);
                }}
                required
                rows={5}
              ></textarea>
            </div>
            <div className="checkbox-option">
              <input id="course-check-1" type="checkbox" />
              <label htmlFor="course-check-1">
                {t('review.saveInfo') ||
                  'Save my name, email, and website in this browser for the next time I comment.'}
              </label>
            </div>
          </div>
          <div className="col-xxl-12">
            <div className="bd-postbox-comment-btn">
              <button type="submit" className="bd-btn btn-outline-primary" disabled={isLoading}>
                {isLoading
                  ? t('common.submitting') || 'Submitting...'
                  : t('review.submitButton') || 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CourseReviewForm;
