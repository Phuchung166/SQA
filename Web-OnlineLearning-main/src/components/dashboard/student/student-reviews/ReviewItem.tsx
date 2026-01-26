import Link from 'next/link';
import { Review, deleteReview } from '@/services/reviewService';
import { message, Modal } from 'antd';
import { useState } from 'react';

interface ReviewItemProps {
  review: Review;
  onDeleted?: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Review',
      content: 'Are you sure you want to delete this review?',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setIsDeleting(true);
          await deleteReview(review.id);
          message.success('Review deleted successfully');
          if (onDeleted) {
            onDeleted();
          }
        } catch (error) {
          console.error('Error deleting review:', error);
          message.error('Failed to delete review');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return (
    <div className="bd-dashboard-review-item mb-30">
      <h5 className="title underline">
        <Link href={`/course-details/${review.course_id}`}>Course Review</Link>
      </h5>
      <div className="course-info d-flex align-content-center justify-content-between flex-wrap gap-2 mb-10">
        <div className="bd-course-rating-wrap d-flex align-items-center gap-10">
          <div className="bd-course-rating-icon fs-14 d-flex rating-color">
            {Array.from({ length: review.rating }).map((_, idx) => (
              <i key={idx} className="fa-solid fa-star" />
            ))}
          </div>
          <div className="bd-course-rating-text">
            <span>{review.rating}.0</span>
          </div>
        </div>
        <div className="bd-button-action">
          <Link href={`/course-details/${review.course_id}`} className="bd-default-tooltip view">
            <span title="View course">
              <i className="fa-sharp fa-light fa-eye" />
            </span>
          </Link>
          <button
            className="bd-default-tooltip delete"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span title="Delete review">
              <i className="fa-light fa-trash-can" />
            </span>
          </button>
        </div>
      </div>
      <p>{review.comment}</p>
      <small className="text-muted d-block">
        {review.created_at
          ? new Date(review.created_at).toLocaleDateString('vi-VN')
          : 'Unknown Date'}
      </small>
    </div>
  );
};

export default ReviewItem;
