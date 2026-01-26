'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReviewItem from './ReviewItem';
import { useAppSelector } from '@/redux/hooks';
import { getReviews, Review } from '@/services/reviewService';
import { message } from 'antd';

const StudentReviewsMain: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user?.id || hasFetched.current) return;

    const fetchUserReviews = async () => {
      try {
        setIsLoading(true);
        const response = await getReviews({
          page: 1,
          pageSize: 100,
          userId: user.id,
          sortBy: 'created_at',
          sortOrder: 'desc',
        });
        setReviews(response.data || []);
        hasFetched.current = true;
      } catch (error) {
        console.error('Error fetching reviews:', error);
        message.error('Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserReviews();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <div className="bd-dashboard-title-inner">
            <h4 className="bd-dashboard-title">Reviews</h4>
          </div>
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="col-xl-9 col-lg-9 col-md-8">
        <div className="bd-dashboard-inner">
          <div className="bd-dashboard-title-inner">
            <h4 className="bd-dashboard-title">Reviews</h4>
          </div>
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            You haven&apos;t posted any reviews yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-xl-9 col-lg-9 col-md-8">
      <div className="bd-dashboard-inner">
        <div className="bd-dashboard-title-inner">
          <h4 className="bd-dashboard-title">Reviews</h4>
        </div>
        <div className="bd-dashboard-reviews-wrapper">
          {reviews.map(review => (
            <ReviewItem
              key={review.id}
              review={review}
              onDeleted={() => {
                setReviews(reviews.filter(r => r.id !== review.id));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentReviewsMain;
