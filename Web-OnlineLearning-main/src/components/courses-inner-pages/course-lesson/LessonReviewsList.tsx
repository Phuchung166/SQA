'use client';

import React, { useState, useEffect } from 'react';
import { Review, getReviews } from '@/services/reviewService';
import { useTranslations } from 'next-intl';
import { Spin, Empty, Space, Button, Popconfirm, message, Pagination } from 'antd';
import Image from 'next/image';
import { deleteReview } from '@/services/reviewService';
import { useAppSelector } from '@/redux/hooks';

interface LessonReviewsListProps {
  courseId?: number;
  filterRating?: number | null;
  refreshKey?: number;
}

const StarRating: React.FC<{ rating: number; size?: 'small' | 'medium' }> = ({
  rating,
  size = 'medium',
}) => {
  const iconSize = size === 'small' ? '14px' : '18px';
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[...Array(5)].map((_, index) => (
        <i
          key={index}
          className={`fa ${index < rating ? 'fas fa-star' : 'far fa-star'}`}
          style={{ color: index < rating ? '#ffc107' : '#ddd', fontSize: iconSize }}
        ></i>
      ))}
    </div>
  );
};

const ReviewCard: React.FC<{
  review: Review;
  currentUserId?: number;
  onReviewDeleted?: () => void;
}> = ({ review, currentUserId, onReviewDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const t = useTranslations('CourseLesson');

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteReview(review.id);
      message.success(t('reviewDeleted') || 'Đánh giá đã được xóa');
      onReviewDeleted?.();
    } catch (error) {
      message.error(t('failedDeleteReview') || 'Lỗi khi xóa đánh giá');
      console.error('Error deleting review:', error);
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = currentUserId === review.user?.id;
  const createdDate = review.created_at
    ? new Date(review.created_at).toLocaleDateString('vi-VN')
    : 'Unknown Date';

  return (
    <div
      style={{
        padding: '20px',
        background: '#fff',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        marginBottom: '15px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Header: Avatar, Name, Date */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div>
          <Image
            src={review.user?.avatar || '/placeholder.png'}
            alt={review.user?.account_name || 'User'}
            width={40}
            height={40}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                {review.user?.account_name || 'Anonymous'}
              </h5>
              <span style={{ fontSize: '12px', color: '#888' }}>{createdDate}</span>
            </div>
            {isOwner && (
              <Popconfirm
                title="Xóa đánh giá"
                description="Bạn có chắc chắn muốn xóa đánh giá này?"
                onConfirm={handleDelete}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  loading={deleting}
                  style={{ fontSize: '12px' }}
                >
                  <i className="fas fa-trash" style={{ marginRight: '4px' }}></i>
                  Xóa
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div style={{ marginBottom: '12px' }}>
        <StarRating rating={review.rating} />
      </div>

      {/* Comment */}
      <p
        style={{
          margin: '0',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#333',
          wordBreak: 'break-word',
        }}
      >
        {review.comment}
      </p>
    </div>
  );
};

const LessonReviewsList: React.FC<LessonReviewsListProps> = ({
  courseId,
  filterRating = null,
  refreshKey = 0,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const currentUser = useAppSelector(state => state.auth.user);
  const t = useTranslations('CourseLesson');

  useEffect(() => {
    if (!courseId) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await getReviews({
          page: 1,
          pageSize: 100,
          courseId,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        setReviews(response.data || []);
        setCurrentPage(1); // Reset to first page when fetching
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [courseId, refreshKey]);

  // Filter reviews by rating if filterRating is set
  const filteredReviews = filterRating ? reviews.filter(r => r.rating === filterRating) : reviews;

  // Pagination calculation
  const totalReviews = filteredReviews.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (filteredReviews.length === 0) {
    return (
      <Empty
        description={
          filterRating
            ? `Không có đánh giá ${filterRating} sao`
            : t('noReviewsYet') || 'Chưa có đánh giá nào'
        }
        style={{ marginTop: '40px', marginBottom: '40px' }}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        {t('totalReviews') || 'Tổng đánh giá'}: <strong>{totalReviews}</strong>
      </div>
      <Space direction="vertical" size={0} style={{ width: '100%' }}>
        {paginatedReviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUser?.id}
            onReviewDeleted={() => {
              setReviews(prev => {
                const newReviews = prev.filter(r => r.id !== review.id);
                // Reset to first page if current page becomes empty
                const newTotal = newReviews.length;
                if (newTotal > 0 && startIndex >= newTotal) {
                  setCurrentPage(Math.ceil(newTotal / pageSize));
                }
                return newReviews;
              });
            }}
          />
        ))}
      </Space>

      {/* Pagination */}
      {totalReviews > pageSize && (
        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalReviews}
            onChange={page => {
              setCurrentPage(page);
              // Scroll to top of reviews
              const reviewsSection = document.querySelector('[data-reviews-section]');
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
              `Hiển thị ${startIndex + 1}-${Math.min(endIndex, total)} trong ${total} đánh giá`
            }
            locale={{
              items_per_page: ' / trang',
              jump_to: 'Đến trang',
              jump_to_confirm: 'xác nhận',
              page: '',
              prev_page: 'Trang trước',
              next_page: 'Trang sau',
              prev_5: 'Lùi 5 trang',
              next_5: 'Tiến 5 trang',
              prev_3: 'Lùi 3 trang',
              next_3: 'Tiến 3 trang',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LessonReviewsList;
