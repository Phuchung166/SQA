package com.ptit.onlinelearning.controller;

import com.ptit.onlinelearning.request.ReviewRequest;
import com.ptit.onlinelearning.model.Course;
import com.ptit.onlinelearning.model.Review;
import com.ptit.onlinelearning.model.User;
import com.ptit.onlinelearning.response.PageableResponse;
import com.ptit.onlinelearning.response.ReviewResponse;
import com.ptit.onlinelearning.response.ReviewStatisticResponse;
import com.ptit.onlinelearning.service.course.ICourseService;
import com.ptit.onlinelearning.service.review.IReviewService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final IReviewService reviewService;
    private final ICourseService courseService;

    @GetMapping
    public ResponseEntity<PageableResponse<ReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = true) Long courseId,
            @RequestParam(required = false) Integer rating
    ){
        Page<Review> reviewPage = reviewService.getAllReviews(page, pageSize, sortBy, sortOrder, userId, courseId, rating);

        List<ReviewResponse> data = reviewPage.getContent().stream().map(ReviewResponse::fromEntity).toList();

        PageableResponse<ReviewResponse> pageableResponse = new PageableResponse<>(
                reviewPage.getNumber() + 1,
                reviewPage.getTotalPages(),
                reviewPage.getTotalElements(),
                reviewPage.getSize(),
                reviewPage.hasNext(),
                reviewPage.hasPrevious(),
                data
        );
        return ResponseEntity.ok(pageableResponse);
    }

    @GetMapping("/statistics/course/{courseId}")
    public ResponseEntity<ReviewStatisticResponse> getCourseReviewStatistic(@PathVariable Long courseId){
        Course course = courseService.getCourseById(courseId);
        return ResponseEntity.ok(ReviewStatisticResponse.fromEntity(course));
    }

    @GetMapping("{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long id) {
        Review review = reviewService.getReviewById(id);
        return ResponseEntity.ok(ReviewResponse.fromEntity(review));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    @Operation(summary = "Create a new review for a course")
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest reviewRequest,
            @AuthenticationPrincipal User user) {

        Review review = reviewService.createReview(user, reviewRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(ReviewResponse.fromEntity(review));
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<Void> deleteReviewById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        reviewService.deleteReviewById(id, user);
        return ResponseEntity.noContent().build();
    }
}
