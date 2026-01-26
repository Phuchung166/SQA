import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getReviewStatistics, ReviewStatistics } from '@/services/reviewService';
import { Spin } from 'antd';

interface Rating {
  stars: number;
  percentage: number;
  count: number;
  barColor: string;
}

interface StudentFeedbackProps {
  courseId?: number;
}

const ratings: Rating[] = [
  { stars: 5, percentage: 90, count: 212, barColor: 'bar-bg-3' },
  { stars: 4, percentage: 75, count: 28, barColor: 'bar-bg-2' },
  { stars: 3, percentage: 50, count: 9, barColor: 'bar-bg-4' },
  { stars: 2, percentage: 30, count: 5, barColor: 'bar-bg-5' },
  { stars: 1, percentage: 10, count: 1, barColor: 'bar-bg-6' },
];

const RatingBar: React.FC<Rating> = ({ stars, percentage, count, barColor }) => (
  <div className="bd-review-progress-bar progress-style-2">
    <div className="bd-review-text">{stars}</div>
    <div className="single-progress">
      <div className="progress">
        <div
          className={`progress-bar ${barColor} wow bdFadeInLeft`}
          data-wow-duration="0.5s"
          data-wow-delay=".3s"
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
    <div className="bd-review-meta">
      <span className="bd-review-percent">{percentage}%</span>
      <span className="bd-review-number">{count}</span>
    </div>
  </div>
);

const StudentFeedback: React.FC<StudentFeedbackProps> = ({ courseId }) => {
  const t = useTranslations('CourseDetails');
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getReviewStatistics(courseId);
        setStats(data);
      } catch (err) {
        console.error('Error fetching review statistics:', err);
        setError('Failed to load review statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [courseId]);

  // Calculate rating distribution percentages
  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="bd-student-feedback mb-30">
        <h3 className="bd-course-details-content-title">{t('studentFeedback')}</h3>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    // Fallback with default data
    const defaultRatings: Rating[] = [
      { stars: 5, percentage: 90, count: 212, barColor: 'bar-bg-3' },
      { stars: 4, percentage: 75, count: 28, barColor: 'bar-bg-2' },
      { stars: 3, percentage: 50, count: 9, barColor: 'bar-bg-4' },
      { stars: 2, percentage: 30, count: 5, barColor: 'bar-bg-5' },
      { stars: 1, percentage: 10, count: 1, barColor: 'bar-bg-6' },
    ];

    return (
      <div className="bd-student-feedback mb-30">
        <h3 className="bd-course-details-content-title">{t('studentFeedback')}</h3>
        <div className="bd-review-rating-wrapper">
          <div className="row gy-30 align-items-center">
            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4">
              <div className="bd-rating-box">
                <div className="bd-rating-box-number">4.9</div>
                <div className="bd-rating-box-icon rating-spacing-2">
                  {[...Array(5)].map((_, index) => (
                    <Link href="#" key={index}>
                      <i className="fa fa-star"></i>
                    </Link>
                  ))}
                </div>
                <span className="bd-rating-box-title">{t('reviewsCount', { count: 234 })}</span>
              </div>
            </div>
            <div className="col-xl-9 col-lg-9 col-md-8 col-sm-12">
              <div className="bd-review-progress-wrapper">
                {defaultRatings.map(rating => (
                  <RatingBar key={rating.stars} {...rating} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build ratings from API data
  const ratings: Rating[] = [
    {
      stars: 5,
      percentage: calculatePercentage(stats.total_rating5, stats.total_reviews),
      count: stats.total_rating5,
      barColor: 'bar-bg-3',
    },
    {
      stars: 4,
      percentage: calculatePercentage(stats.total_rating4, stats.total_reviews),
      count: stats.total_rating4,
      barColor: 'bar-bg-2',
    },
    {
      stars: 3,
      percentage: calculatePercentage(stats.total_rating3, stats.total_reviews),
      count: stats.total_rating3,
      barColor: 'bar-bg-4',
    },
    {
      stars: 2,
      percentage: calculatePercentage(stats.total_rating2, stats.total_reviews),
      count: stats.total_rating2,
      barColor: 'bar-bg-5',
    },
    {
      stars: 1,
      percentage: calculatePercentage(stats.total_rating1, stats.total_reviews),
      count: stats.total_rating1,
      barColor: 'bar-bg-6',
    },
  ];

  return (
    <div className="bd-student-feedback mb-30">
      <h3 className="bd-course-details-content-title">{t('studentFeedback')}</h3>
      <div className="bd-review-rating-wrapper">
        <div className="row gy-30 align-items-center">
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4">
            <div className="bd-rating-box">
              <div className="bd-rating-box-number">{(stats.avg_rating || 0).toFixed(1)}</div>
              <div className="bd-rating-box-icon rating-spacing-2">
                {[...Array(5)].map((_, index) => (
                  <Link href="#" key={index}>
                    <i
                      className={`fa ${
                        index < Math.round(stats.avg_rating || 0) ? 'fa-star' : 'fa-star-o'
                      }`}
                    ></i>
                  </Link>
                ))}
              </div>
              <span className="bd-rating-box-title">
                {t('reviewsCount', { count: stats.total_reviews })}
              </span>
            </div>
          </div>
          <div className="col-xl-9 col-lg-9 col-md-8 col-sm-12">
            <div className="bd-review-progress-wrapper">
              {ratings.map(rating => (
                <RatingBar key={rating.stars} {...rating} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
