package com.ptit.onlinelearning.service.review;

import com.ptit.onlinelearning.request.ReviewRequest;
import com.ptit.onlinelearning.exception.DataNotFoundException;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Enrollment;
import com.ptit.onlinelearning.model.Review;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.repository.CourseRepository;
import com.ptit.onlinelearning.repository.EnrollmentRepository;
import com.ptit.onlinelearning.repository.ReviewRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService implements IReviewService{

    private final ReviewRepository reviewRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Override
    public Page<Review> getAllReviews(int page, int pageSize, String sortBy, String sortOrder, Long userId, Long courseId, Integer rating) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        Specification<Review> spec = ((root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if(userId != null){
                predicates.add(criteriaBuilder.equal(root.join("user").get("id"), userId));
            }
            if(courseId != null){
                predicates.add(criteriaBuilder.equal(root.join("course").get("id"), courseId));
            }
            if(rating != null){
                predicates.add(criteriaBuilder.equal(root.get("rating"), rating));
            }
            return  criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
        return reviewRepository.findAll(spec, pageable);
    }

    @Override
    public Review getReviewById(Long id) {
        return reviewRepository.findById(id).orElseThrow(()->new DataNotFoundException("Review not found: " + id));
    }

    @Override
    public Review createReview(User user, ReviewRequest reviewRequest) {
        Course course = courseRepository.findById(reviewRequest.getCourseId()).orElseThrow(()->new DataNotFoundException("Course not found: " + reviewRequest.getCourseId()));
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), course.getId()).orElse(null);
        if(enrollment == null || (enrollment.getEndDate() != null && LocalDateTime.now().isAfter(enrollment.getEndDate())) ){
            throw new AccessDeniedException("Cannot create review, please enroll course");
        }
        Review review =  new Review();
        review.setUser(user);
        review.setCourse(course);
        review.setEnrollment(enrollment);
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        return reviewRepository.save(review);
    }

    @Override
    public void deleteReviewById(Long id, User user) {
        Review review = getReviewById(id);
        if(!user.hasAdminRole() && !review.getUser().getId().equals(user.getId())){
            throw new AccessDeniedException("Forbidden to delete review id: " + id);
        }
        reviewRepository.delete(review);
    }
}
