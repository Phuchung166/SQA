package com.ptit.onlinelearning.service.review;

import com.ptit.onlinelearning.request.ReviewRequest;
import com.ptit.onlinelearning.model.Review;
import com.ptit.onlinelearning.model.User;
import org.springframework.data.domain.Page;

public interface IReviewService {
    Page<Review> getAllReviews(
            int page, int pageSize,
            String sortBy, String sortOrder,
            Long userId, Long courseId, Integer rating
    );
    Review getReviewById(Long id);
    Review createReview(User user, ReviewRequest reviewRequest);
    void deleteReviewById(Long id, User user);
}
